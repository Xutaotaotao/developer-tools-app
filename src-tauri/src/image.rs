use photon_rs::PhotonImage;
use photon_rs::channels;
use std::collections::HashMap;
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::time::Instant;

lazy_static! {
  static ref CACHED_IMAGES: Mutex<HashMap<String, PhotonImage>> = Mutex::new(HashMap::new());
}

pub(crate) fn create_photon_image(pixels: Vec<u8>) -> PhotonImage {
  let pixels_identifier = calculate_pixels_identifier(&pixels);
  let mut cache = CACHED_IMAGES.lock().unwrap();
  if let Some(cached_img) = cache.get(&pixels_identifier) {
      return cached_img.clone();
  }
  let new_img = PhotonImage::new_from_byteslice(pixels.clone());
  cache.insert(pixels_identifier, new_img.clone());
  new_img
}

pub(crate) fn process_photon_image(img: &mut PhotonImage, method: &str) {
  match method {
      "alter_red_channel" => channels::alter_red_channel(img, 100),
      "alter_green_channel" => channels::alter_green_channel(img, 100),
      "alter_blue_channel" => channels::alter_blue_channel(img, 100),
      "remove_red_channel" => channels::remove_red_channel(img, 100_u8),
      "remove_green_channel" => channels::remove_green_channel(img, 100_u8),
      "remove_blue_channel" => channels::remove_blue_channel(img, 100_u8),
      _ => (),
  }
}

pub(crate) fn photo_channel(pixels: Vec<u8>, method: &str) -> String {
  let start = Instant::now();
  let mut img = create_photon_image(pixels);
  process_photon_image(&mut img, method);
  let duration = start.elapsed();
  println!("Time elapsed: {:?}", duration);
  let res = img.get_base64();
  res
}

fn calculate_pixels_identifier(pixels: &[u8]) -> String {
  String::from_utf8_lossy(pixels).to_string()
}