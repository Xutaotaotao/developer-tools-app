// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod compress_image;
mod network;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn compress_image(img_buffer: Vec<u8>,quality: u8) -> compress_image::CompressResult {
    compress_image::compress_image(img_buffer,quality)
}

#[tauri::command]
fn get_local_ip() -> Option<String> {
    network::get_local_ip()
}

#[tauri::command]
fn get_dns() -> String {
    network::get_dns()
}

fn main() {
    // use tauri::Manager;
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            compress_image,
            get_local_ip,
            get_dns
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
