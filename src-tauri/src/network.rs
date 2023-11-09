use std::{net::UdpSocket, process::Command};

/// get the local ip address, return an `Option<String>`. when it fail, return `None`.
pub(crate) fn get_local_ip() -> Option<String> {
    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(s) => s,
        Err(_) => return None,
    };

    match socket.connect("8.8.8.8:80") {
        Ok(()) => (),
        Err(_) => return None,
    };

    match socket.local_addr() {
        Ok(addr) => return Some(addr.ip().to_string()),
        Err(_) => return None,
    };
}

pub(crate) fn get_dns() -> String {
    let output = Command::new("networksetup")
        .arg("-getdnsservers")
        .arg("Wi-Fi")
        .output()
        .expect("failed to execute process");

    let dns_servers = String::from_utf8(output.stdout).unwrap().trim().to_string();
    return dns_servers;
}
