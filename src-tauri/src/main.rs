// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod network;
mod image;

use tauri::InvokeError;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn get_local_ip() -> Option<String> {
    network::get_local_ip()
}

#[tauri::command]
fn get_dns() -> String {
    network::get_dns()
}

#[tauri::command]
async fn set_dns(servers: Vec<String>) -> Result<(), InvokeError> {
    let _ = network::set_dns(servers);
    Ok(())
}

#[tauri::command(async)]
fn photo_channel(pixels: Vec<u8>,method:&str) -> String {
    image::photo_channel(pixels,method)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_local_ip,
            get_dns,
            set_dns,
            photo_channel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
