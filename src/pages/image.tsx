import { Card, Upload, Row, Col, Menu, Button, Space } from "antd";
import { useTranslation } from "react-i18next";
import type { MenuProps, UploadFile } from "antd";
import { InboxOutlined, DownloadOutlined,ReloadOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { writeBinaryFile } from "@tauri-apps/api/fs";
import { path, dialog } from "@tauri-apps/api";

const { Dragger } = Upload;

interface FileItem extends UploadFile {
  dealData?: any;
  originImgBuffer: ArrayBuffer;
}
interface Image {
  new (): HTMLImageElement;
}

const Image = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wasm, setWasm] = useState<any>("");
  const [currentImg, setCurrentImg] = useState("");
  const [fileList, setFileList] = useState<Array<any>>([]);
  const [current, setCurrent] = useState("alter_red_channel");
  const items: MenuProps["items"] = [
    {
      label: t("Channel"),
      key: "Channel",
      children: [
        {
          label: "AlterRedChannel",
          key: "inc_red_channel",
        },
        {
          label: "AlterGreenChannel",
          key: "inc_blue_channel",
        },
        {
          label: "AlterBlueChannel",
          key: "inc_green_channel",
        },
        {
          label: "RemoveRedChannel",
          key: "dec_red_channel",
        },
        {
          label: "RemoveGreenChannel",
          key: "dec_green_channel",
        },
        {
          label: "RemoveBlueChannel",
          key: "dec_blue_channel",
        },
      ],
    },
  ];

  const loadWasm = async () => {
    try {
      const photon = await import("@silvia-odwyer/photon");
      setWasm(photon);
    } finally {
      console.log("loaded wasm successfully");
    }
  };

  const resetImg = () => {
    setCurrent('')
    const file = fileList[0];
    let reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    const img: any = document.createElement("img");
    reader.onload = function (e: any) {
      setCurrentImg(img);
      img.src = e.target.result;
    };
    img.onload = function () {
      const canvas: any = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
    };
  };

  const filesChange = (info: any) => {
    const hasFile = fileList.find(
      (file: FileItem) => info.file.name === file.name
    );
    if (hasFile) {
      return;
    } else {
      setFileList([info.file]);
      let reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
      const img: any = document.createElement("img");
      reader.onload = function (e: any) {
        setCurrentImg(img);
        img.src = e.target.result;
      };
      img.onload = function () {
        const canvas: any = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const colour_space = (
    module: any,
    rust_image: any,
    colour_space: any,
    effect: any
  ) => {
    if (colour_space == "hsl") {
      return module.lch(rust_image, effect, 0.3);
    } else if (colour_space == "hsv") {
      return module.hsv(rust_image, effect, 0.3);
    } else {
      return module.lch(rust_image, effect, 0.3);
    }
  };

  const applyEffect = async (code: string) => {
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(currentImg, 0, 0);
    let module = wasm;
    let rust_image = module.open_image(canvas, ctx);

    let filter_dict: any = {
      grayscale: function () {
        return module.grayscale(rust_image);
      },
      offset_red: function () {
        return module.offset(rust_image, 0, 25);
      },
      offset_blue: function () {
        return module.offset(rust_image, 1, 25);
      },
      offset_green: function () {
        return module.offset(rust_image, 2, 25);
      },
      primary: function () {
        return module.primary(rust_image);
      },
      solarize: function () {
        return module.solarize(rust_image);
      },
      oil: function () {
        return module.oil(rust_image, 4, 55.0);
      },
      threshold: function () {
        return module.threshold(rust_image, 100);
      },
      sepia: function () {
        return module.sepia(rust_image);
      },
      decompose_min: function () {
        return module.decompose_min(rust_image);
      },
      decompose_max: function () {
        return module.decompose_max(rust_image);
      },
      grayscale_shades: function () {
        return module.grayscale_shades(rust_image, 8);
      },
      red_channel_grayscale: function () {
        return module.single_channel_grayscale(rust_image, 0);
      },
      green_channel_grayscale: function () {
        return module.single_channel_grayscale(rust_image, 1);
      },
      blue_channel_grayscale: function () {
        return module.single_channel_grayscale(rust_image, 2);
      },
      hue_rotate_hsl: function () {
        return colour_space(module, rust_image, "hsl", "shift_hue");
      },
      hue_rotate_hsv: function () {
        return colour_space(module, rust_image, "hsv", "shift_hue");
      },
      hue_rotate_lch: function () {
        return colour_space(module, rust_image, "lch", "shift_hue");
      },
      lighten_hsl: function () {
        return colour_space(module, rust_image, "hsl", "lighten");
      },
      lighten_hsv: function () {
        return colour_space(module, rust_image, "hsv", "lighten");
      },
      lighten_lch: function () {
        return colour_space(module, rust_image, "lch", "lighten");
      },
      darken_hsl: function () {
        return colour_space(module, rust_image, "hsl", "darken");
      },
      darken_hsv: function () {
        return colour_space(module, rust_image, "hsv", "darken");
      },
      darken_lch: function () {
        return colour_space(module, rust_image, "lch", "darken");
      },
      desaturate_hsl: function () {
        return colour_space(module, rust_image, "hsl", "desaturate");
      },
      desaturate_hsv: function () {
        colour_space(module, rust_image, "hsv", "desaturate");
      },
      desaturate_lch: function () {
        return colour_space(module, rust_image, "lch", "desaturate");
      },
      saturate_hsl: function () {
        return colour_space(module, rust_image, "hsl", "saturate");
      },
      saturate_hsv: function () {
        return colour_space(module, rust_image, "hsv", "saturate");
      },
      saturate_lch: function () {
        return colour_space(module, rust_image, "lch", "saturate");
      },
      inc_red_channel: function () {
        return module.alter_channel(rust_image, 0, 90);
      },
      inc_blue_channel: function () {
        return module.alter_channel(rust_image, 2, 90);
      },
      inc_green_channel: function () {
        return module.alter_channel(rust_image, 1, 90);
      },
      inc_two_channels: function () {
        return module.alter_channel(rust_image, 1, 30);
      },
      dec_red_channel: function () {
        return module.alter_channel(rust_image, 0, -30);
      },
      dec_blue_channel: function () {
        return module.alter_channel(rust_image, 2, -30);
      },
      dec_green_channel: function () {
        return module.alter_channel(rust_image, 1, -30);
      },
      swap_rg_channels: function () {
        return module.swap_channels(rust_image, 0, 1);
      },
      swap_rb_channels: function () {
        return module.swap_channels(rust_image, 0, 2);
      },
      swap_gb_channels: function () {
        return module.swap_channels(rust_image, 1, 2);
      },
      remove_red_channel: function () {
        return module.remove_red_channel(rust_image, 250);
      },
      remove_green_channel: function () {
        return module.remove_green_channel(rust_image, 250);
      },
      remove_blue_channel: function () {
        return module.remove_blue_channel(rust_image, 250);
      },
      emboss: function () {
        return module.emboss(rust_image);
      },
      box_blur: function () {
        return module.box_blur(rust_image);
      },
      gradient: function () {
        return module.apply_gradient(rust_image);
      },
      sharpen: function () {
        return module.sharpen(rust_image);
      },
      duotone: function () {
        return module.duotone(rust_image, 0, 2);
      },
      lix: function () {
        return module.lix(rust_image);
      },
      neue: function () {
        return module.neue(rust_image);
      },
      ryo: function () {
        return module.ryo(rust_image);
      },
      gaussian_blur: function () {
        return module.gaussian_blur(rust_image);
      },
      horizontal_strips: function () {
        return module.horizontal_strips(rust_image, 6);
      },
      vertical_strips: function () {
        return module.vertical_strips(rust_image, 6);
      },
      inc_brightness: function () {
        return module.inc_brightness(rust_image, 20);
      },
      inc_lum: function () {
        return module.inc_luminosity(rust_image);
      },
      grayscale_human_corrected: function () {
        return module.grayscale_human_corrected(rust_image);
      },
      // watermark: function () {
      //   return module.watermark(rust_image, watermark_img, 10, 30);
      // },
      flipv: function () {
        return module.flipv(rust_image);
      },
      fliph: function () {
        return module.fliph(rust_image);
      },
      sobel_horizontal: function () {
        return module.sobel_horizontal(rust_image);
      },
      sobel_vertical: function () {
        return module.sobel_vertical(rust_image);
      },
      laplace: function () {
        return module.laplace(rust_image);
      },
      prewitt: function () {
        return module.prewitt_horizontal(rust_image);
      },
      noise_reduction: function () {
        return module.noise_reduction(rust_image);
      },
      identity: function () {
        return module.identity(rust_image);
      },
      edge_one: function () {
        return module.edge_one(rust_image);
      },
      edge_detection: function () {
        return module.edge_detection(rust_image);
      },
      lofi: function () {
        return module.lofi(rust_image);
      },
      cali: function () {
        return module.cali(rust_image);
      },
      obsidian: function () {
        return module.obsidian(rust_image);
      },
      firenze: function () {
        return module.firenze(rust_image);
      },
      pastel_pink: function () {
        return module.pastel_pink(rust_image);
      },
      dramatic: function () {
        return module.dramatic(rust_image);
      },
      golden: function () {
        return module.golden(rust_image);
      },
    };
    filter_dict[code]();
    module.putImageData(canvas, ctx, rust_image);
  };

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  const handleSaveFile = async () => {
    const basePath = await path.downloadDir();
    let selPath: any = await dialog.save({
      defaultPath: basePath,
    });
    selPath = selPath.replace(/Untitled$/, "");
    const canvas: any = canvasRef.current;
    canvas.toBlob(function (blob: Blob) {
      blob.arrayBuffer().then(function (arrayBuffer) {
        const file = fileList[0];
        console.log(file);
        let fileU8A = new Uint8Array(arrayBuffer);
        writeBinaryFile({ contents: fileU8A, path: `${selPath}test.png` });
      });
    });
  };

  useEffect(() => {
    if (current && fileList.length && currentImg) {
      applyEffect(current);
    }
  }, [current, fileList, currentImg]);

  useEffect(() => {
    loadWasm();
  }, []);

  return (
    <Card className="layout-card">
      <Row gutter={16}>
        <Col span={20}>
          <Dragger
            name="file"
            multiple
            onChange={filesChange}
            fileList={fileList}
            customRequest={() => {}}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t("Click or drag file to this area to upload")}
            </p>
          </Dragger>
        </Col>
        <Col span={4}>
          <Space direction="vertical">
            <div>
              <Button
                disabled={fileList.length === 0}
                style={{ width: "100%" }}
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => resetImg()}
              >
                Reset
              </Button>
            </div>
            <div>
              <Button
                disabled={fileList.length === 0}
                style={{ width: "100%" }}
                size="large"
                icon={<DownloadOutlined />}
                type="primary"
                onClick={() => handleSaveFile()}
              >
                Download
              </Button>
            </div>
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "5px" }}>
        <Col span={6}>
          <Menu
            disabled={!fileList.length}
            mode="inline"
            openKeys={["Channel"]}
            onClick={onClick}
            selectedKeys={[current]}
            items={items}
          />
        </Col>
        <Col span={18}>
          <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
        </Col>
      </Row>
    </Card>
  );
};

export default Image;
