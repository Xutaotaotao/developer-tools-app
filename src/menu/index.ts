
import type { ComponentClass, FunctionComponent } from 'react';
import { HomeOutlined,FileZipOutlined } from '@ant-design/icons';


export interface Menu {
  path:string;
  icon: string | FunctionComponent<any> | ComponentClass<any, any>;
  name:string;
}

export const menus:Array<Menu> = [
  {path:'/',icon: HomeOutlined,name:'home' },
  {path:'/CompressImage',icon: FileZipOutlined,name:'CompressImage' },

]
