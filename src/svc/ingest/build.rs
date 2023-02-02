use std::{
    collections::HashSet,
    fs::File,
    io::Write,
    path::PathBuf,
};

macro_rules! relpath {
    ($path:tt) => {
        concat!(env!("CARGO_MANIFEST_DIR"), concat!("/", $path))
    };
}

fn main() -> eyre::Result<()> {
    let base_dir = tempfile::tempdir()?;
    let workdir = base_dir.path();

    if let Err(e) = dotenv::from_filename(relpath!("../../../.devlinks/rust.env")) {
        println!("unable to load dotenv: {e}");
    }

    println!("cargo-rerun-if-env-changed=NANOPB_PROTO");
    let nanopb_proto =
        std::env::var("NANOPB_PROTO").unwrap_or(relpath!(".devlinks/nanopb").to_owned());

    println!("cargo-rerun-if-changed={}", relpath!("../../../proto"));

    prost_build::Config::new().out_dir(workdir).format(false).compile_protos(
        &["../../../proto/svc.proto", "../../../proto/message.proto"],
        &["../../../proto", &nanopb_proto],
    )?;

    let elems = std::fs::read_dir(workdir)?.collect::<Result<Vec<_>, _>>()?;

    let mut required_paths = HashSet::new();

    elems
        .into_iter()
        .filter(|dirent| {
            let path = dirent.path();
            if !path.is_file() {
                return false;
            }

            let fname = path.file_name().unwrap().to_string_lossy();
            let fname = fname.as_bytes();
            fname != b"_.rs" && fname.ends_with(b".rs")
        })
        .for_each(|dirent| {
            let path = dirent.path();

            let base_name = path.file_stem().unwrap().to_string_lossy().into_owned();

            let path_elems = base_name.split('.').map(|x| x.to_string()).collect::<Vec<_>>();

            for i in 0..path_elems.len() {
                required_paths.insert(path_elems[..=i].to_vec());
            }
        });

    println!("{required_paths:?}");
    let required_paths = required_paths.drain().collect::<Vec<_>>();

    for path in required_paths {
        let mut parent = path.iter().cloned().rev().skip(1).rev().collect::<Vec<_>>();
        if parent.is_empty() {
            parent = vec!["mod".to_owned()];
        }

        let parent_filename = workdir.join(format!("{}.rs", parent.join(".")));

        if !parent_filename.exists() {
            File::create(&parent_filename)?;
            println!("creating parent {parent_filename:?}");
        }

        let content =
            format!(r#"#[path = "{}.rs"] pub mod {};"#, path.join("."), path.last().unwrap());

        println!("writing {parent_filename:?}: {content}");

        let mut parent_file = File::options()
            .create(false)
            .write(true)
            .append(true)
            .truncate(false)
            .open(parent_filename)?;

        parent_file.write_all(content.as_bytes())?;
    }

    let tmppath = PathBuf::from(relpath!("src/.pb.tmp"));
    let _ = std::fs::remove_dir_all(&tmppath);
    std::fs::create_dir_all(&tmppath)?;

    for ent in walkdir::WalkDir::new(workdir).into_iter().filter_map(|e| e.ok()) {
        if !ent.file_type().is_file() {
            continue;
        }

        let src = ent.path();
        let dst = tmppath.join(ent.path().file_name().unwrap());

        println!("copy {src:?} -> {dst:?}");

        std::fs::copy(src, dst)?;
    }

    let target_path = PathBuf::from(relpath!("src/pb"));

    if target_path.exists() {
        println!("clean {target_path:?}");
        std::fs::remove_dir_all(&target_path)?;
    }

    println!("rename {tmppath:?} -> {target_path:?}");
    std::fs::rename(&tmppath, &target_path)?;

    Ok(())
}
