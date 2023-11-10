use photon_rs::PhotonImage;
use photon_rs::channels;


pub(crate) fn photo_channel(pixels: Vec<u8>,method:&str) -> String {
  let mut img = PhotonImage::new_from_byteslice(pixels);
  match method {
    "alter_red_channel" => channels::alter_red_channel(&mut img,100), 
    "alter_green_channel" => channels::alter_green_channel(&mut img,100),
    "alter_blue_channel" => channels::alter_blue_channel(&mut img,100),
    _ => (),
  }
  let res = img.get_base64();
  res
}

