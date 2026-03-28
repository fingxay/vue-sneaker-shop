# Vue Sneaker Shop

Ứng dụng bán giày sneaker xây bằng Vue 3 theo mô hình client-side, dùng `json-server` làm mock API cho sản phẩm, tài khoản, giỏ hàng và đơn hàng. Dự án phục vụ các chức năng cơ bản của một website thương mại điện tử như đăng ký, đăng nhập, xem sản phẩm, thêm vào giỏ, thanh toán và theo dõi hóa đơn.

## Mục tiêu bài làm

- Xây dựng giao diện bán hàng với Vue 3 và Vue Router.
- Làm việc với dữ liệu giả lập thông qua `json-server`.
- Quản lý luồng mua hàng từ xem sản phẩm đến đặt đơn.
- Thực hành validation form, route guard và lưu trạng thái đăng nhập bằng `localStorage`.

## Công nghệ sử dụng

- Vue 3
- Vue Router 4
- Axios
- Pinia
- JSON Server
- Vue CLI

## Chức năng chính

- Hiển thị danh sách sản phẩm sneaker.
- Banner trang chủ.
- Tìm kiếm sản phẩm theo tên hoặc thương hiệu.
- Lọc sản phẩm theo brand: Nike, Adidas, MLB, Vans, New Balance, Puma.
- Phân trang danh sách sản phẩm.
- Xem chi tiết sản phẩm, chọn size, chọn số lượng theo tồn kho.
- Đăng ký tài khoản mới.
- Đăng nhập và lưu phiên đăng nhập bằng `localStorage`.
- Route guard cho các trang cần đăng nhập: giỏ hàng, hồ sơ, thanh toán, hóa đơn.
- Thêm sản phẩm vào giỏ hàng theo `productId + size`.
- Cập nhật số lượng và xóa sản phẩm trong giỏ hàng.
- Lưu thông tin giao hàng trong trang hồ sơ.
- Tạo đơn hàng ở trang checkout.
- Tính phí vận chuyển:
  - Miễn phí với đơn từ `1.000.000đ`
  - Thu `30.000đ` với đơn dưới mức này
- Trừ tồn kho khi đặt hàng.
- Xem lịch sử hóa đơn của người dùng.
- Hủy đơn hàng đang chờ xác nhận và hoàn lại tồn kho.

## Cấu trúc dữ liệu mock

File dữ liệu chính nằm tại `src/data/db.json`, gồm 3 nhóm:

- `products`: thông tin sản phẩm, giá, ảnh, mô tả, danh sách size và số lượng tồn.
- `users`: tài khoản người dùng, vai trò, giỏ hàng, thông tin giao hàng.
- `orders`: đơn hàng đã tạo, trạng thái đơn, danh sách sản phẩm và tổng tiền.

## Các màn hình chính

- Trang chủ: banner + danh sách sản phẩm.
- Trang chi tiết sản phẩm.
- Trang đăng nhập / đăng ký.
- Trang giỏ hàng.
- Trang thanh toán.
- Trang hồ sơ cá nhân.
- Trang hóa đơn / lịch sử đơn hàng.

## Cách chạy dự án

### 1. Cài dependencies

```bash
npm install
```

### 2. Chạy mock API với JSON Server

Nếu máy chưa có `json-server`, cài trước:

```bash
npm install -g json-server
```

Sau đó chạy:

```bash
npm run db
```

Mock API sẽ chạy tại:

```text
http://localhost:3000
```

### 3. Chạy frontend

Mở terminal khác và chạy:

```bash
npm run serve
```

Frontend mặc định chạy tại:

```text
http://localhost:8080
```

## Scripts

```bash
npm run serve   # chạy môi trường development
npm run build   # build production
npm run lint    # kiểm tra eslint
npm run db      # chạy json-server với src/data/db.json
```

## Tài khoản mẫu

Có thể dùng dữ liệu có sẵn trong `src/data/db.json`:

- User:
  - Email: `vana@gmail.com`
  - Password: `123456`
- Admin:
  - Email: `admin@gmail.com`
  - Password: `admin123`

Lưu ý: hiện tại dự án có dữ liệu admin trong mock API nhưng phần giao diện tập trung vào phía client mua hàng, chưa triển khai dashboard quản trị riêng.

## Cấu trúc thư mục

```text
src/
|-- assets/                 # ảnh banner, ảnh sản phẩm
|-- components/
|   |-- client/             # header, footer, card, list, modal...
|   |-- common/             # component dùng chung
|-- data/
|   |-- db.json             # mock database cho json-server
|-- router/
|   |-- index.js            # cấu hình route + guard
|-- views/
|   |-- client/             # các trang phía người dùng
|-- App.vue
|-- main.js
```

## Luồng hoạt động chính
Developer: Reload Window
1. Người dùng vào trang chủ để xem danh sách sản phẩm.
2. Có thể lọc theo thương hiệu hoặc tìm kiếm theo từ khóa.
3. Chọn sản phẩm để xem chi tiết, chọn size và số lượng.
4. Đăng nhập trước khi thêm vào giỏ và thanh toán.
5. Ở giỏ hàng, người dùng cập nhật số lượng hoặc xóa sản phẩm.
6. Tại checkout, người dùng nhập thông tin nhận hàng và chọn phương thức thanh toán.
7. Khi đặt hàng:
   - tạo bản ghi trong `orders`
   - cập nhật lại tồn kho sản phẩm
   - xóa giỏ hàng của user
8. Người dùng xem lại đơn ở trang hóa đơn và có thể hủy đơn khi trạng thái còn `pending`.

## Điểm đáng chú ý

- Dữ liệu đăng nhập hiện lưu ở `localStorage`, phù hợp cho bài tập mô phỏng frontend, chưa phải giải pháp bảo mật thực tế.
- Backend hiện là mock API nên chưa có xác thực JWT, phân quyền server-side hay thanh toán thật.
- Một số file dữ liệu tiếng Việt trong dự án đang có dấu hiệu lệch encoding, nhưng không ảnh hưởng đến cấu trúc chức năng chính của bài.

## Hướng phát triển thêm

- Tách store dùng Pinia để quản lý giỏ hàng và user tập trung hơn.
- Bổ sung trang quản trị sản phẩm / đơn hàng.
- Thêm bộ lọc giá, sắp xếp sản phẩm.
- Kết nối backend thật với cơ sở dữ liệu.
- Thêm thanh toán online thực tế.
- Bổ sung toast, loading state và xử lý lỗi đồng bộ hơn trên toàn hệ thống.
