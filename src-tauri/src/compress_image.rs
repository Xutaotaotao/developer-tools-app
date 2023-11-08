use image::GenericImageView;
use image::ImageOutputFormat;
use image::imageops;
use serde::Serialize;

#[derive(Serialize)]
pub struct CompressResult {
  data: Vec<u8>,
  size: usize
}

pub(crate) fn compress_image(img_buffer: Vec<u8>, quality: u8) -> CompressResult {
    let img_buffer_ref: &[u8] = img_buffer.as_ref();
    let img = image::load_from_memory(img_buffer_ref).unwrap();
    let (width, height) = img.dimensions();
    let img_resized = img.resize_exact(width, height, imageops::FilterType::Lanczos3);
    let mut output = Vec::new();
    img_resized
        .write_to(&mut output, ImageOutputFormat::Jpeg(quality))
        .unwrap();
    let result = CompressResult {
      data: output.clone(),
      size: output.len()
    };
    return result;
}
