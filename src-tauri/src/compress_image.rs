use image::{GenericImageView, ImageOutputFormat, imageops};
use serde::Serialize;
// use std::time::Instant;

#[derive(Serialize)]
pub struct CompressResult {
  data: Vec<u8>,
  size: usize
}

pub(crate) fn compress_image(img_buffer: Vec<u8>, quality: u8) -> CompressResult {
  // let start = Instant::now();
  let img = image::load_from_memory(&img_buffer).unwrap();
  let img_resized = img.resize_exact(img.width(), img.height(), imageops::FilterType::Triangle);
  let mut output = Vec::new();
  img_resized
    .write_to(&mut output, ImageOutputFormat::Jpeg(quality)) 
    .unwrap();

  let result = CompressResult {
    data: output.clone(),
    size: output.len()
  };
  // let duration = start.elapsed();
  // println!("Time elapsed: {:?}", duration);
  result
}
