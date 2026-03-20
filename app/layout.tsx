import './globals.css';
import { Shell } from '@/components/Shell';

export const metadata = {
  title: 'Mini Hugging Face',
  description: '企业内部模型与数据集管理平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
