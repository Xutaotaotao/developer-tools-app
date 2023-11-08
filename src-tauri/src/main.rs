// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use compress_image::CompressResult;

mod compress_image;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn add(a:i32,b:i32) -> i32 {
    return a + b
} 

#[tauri::command]
async fn compress_image(img_buffer: Vec<u8>, quality: u8) -> Result<CompressResult, tauri::Error> {
    Ok(compress_image::compress_image(img_buffer, quality))
}

fn main() {
    use tauri::Manager;
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,add,compress_image])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
              let window = app.get_window("main").unwrap();
              window.open_devtools();
            //   window.close_devtools();
            }
            Ok(())
          })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
