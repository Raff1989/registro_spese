#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use tauri::Manager;

// 👉 Comando Tauri: DEVE stare fuori dal builder
#[tauri::command]
fn get_author() -> String {
    env!("CARGO_PKG_AUTHORS").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Plugin Tauri 2
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())

        // Setup (rimane identico)
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })

        // 👉 Qui registri il comando
        .invoke_handler(tauri::generate_handler![get_author])

        // Avvio app
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
