# Vue Sneaker Shop

Ứng dụng bán giày sneaker xây dựng bằng Vue 3 theo mô hình SPA, sử dụng `json-server` làm mock API. Project mô phỏng tương đối đầy đủ một hệ thống thương mại điện tử nhỏ với hai khu vực chính:

- Client shop: xem sản phẩm, tìm kiếm, lọc brand, thêm vào giỏ, thanh toán, theo dõi đơn hàng.
- Admin panel: quản lý sản phẩm, đơn hàng, người dùng, doanh thu và xuất báo cáo PDF.

## Tổng quan dự án

Project hiện tại có:

- 27 sản phẩm trong dữ liệu mẫu.
- 6 tài khoản người dùng trong mock database, gồm cả admin.
- Nhiều đơn hàng mẫu với nhiều trạng thái khác nhau để test luồng client, admin và revenue.
- Mock database tại `src/data/db.json`.

Ứng dụng chạy hoàn toàn phía frontend, giao tiếp với mock API qua `axios` đến `http://localhost:3000`.

## Công nghệ sử dụng

- Vue 3
- Vue Router 4
- Axios
- Vue CLI
- JSON Server
- Pinia

Ghi chú:

- `Pinia` đã được cài và khởi tạo trong `src/main.js`, nhưng hiện tại project chưa tách store riêng, phần lớn state vẫn đang được xử lý trực tiếp trong component.
- Project có chức năng biểu đồ dashboard và xuất PDF doanh thu. Nếu sau này bổ sung hoặc thay đổi package liên quan, nên cập nhật lại mục này theo đúng `package.json`.

## Chức năng chính

### 1. Khu vực client

- Hiển thị banner trang chủ.
- Hiển thị danh sách sản phẩm dạng lưới.
- Tìm kiếm sản phẩm theo tên hoặc thương hiệu.
- Lọc sản phẩm theo brand: `Nike`, `Adidas`, `MLB`, `Vans`, `New Balance`, `Puma`.
- Ẩn các sản phẩm có `isActive = false`.
- Phân trang danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Chọn size theo tồn kho thực tế.
- Chọn số lượng theo giới hạn stock của size đã chọn.
- Thêm vào giỏ hàng theo tổ hợp `productId + size`.
- Đăng ký tài khoản mới với `isActive: true` mặc định.
- Đăng nhập và lưu phiên đăng nhập bằng `localStorage`.
- Route guard cho các trang cần đăng nhập.
- Nếu tài khoản bị khóa:
  - chặn đăng nhập mới
  - nếu đang đăng nhập mà reload hoặc đổi route sẽ bị đăng xuất và chuyển về trang đăng nhập
- Xem, tăng giảm số lượng, xóa sản phẩm trong giỏ hàng.
- Lưu thông tin giao hàng trong trang hồ sơ cá nhân.
- Tự động điền thông tin giao hàng ở trang checkout từ profile.
- Hỗ trợ hai hình thức thanh toán:
  - COD
  - Chuyển khoản giả lập bằng QR
- Tạo đơn hàng mới từ giỏ hàng.
- Trừ tồn kho khi đặt hàng.
- Xóa giỏ hàng sau khi checkout thành công.
- Xem lịch sử đơn hàng theo từng user.
- Lọc đơn hàng theo trạng thái.
- Phân trang danh sách đơn hàng phía client.
- Hủy đơn ở trạng thái `pending` và hoàn trả tồn kho.
- Đăng xuất có hộp thoại xác nhận bằng `BaseConfirmModal`.

### 2. Khu vực admin

#### Dashboard

- Thống kê:
  - tổng số sản phẩm
  - số sản phẩm đang hiển thị
  - tổng số đơn hàng
  - tổng số user
  - doanh thu từ đơn hoàn thành
- Biểu đồ trạng thái đơn hàng.
- Biểu đồ doanh thu theo:
  - 7 ngày gần nhất
  - 30 ngày gần nhất
  - 12 tháng gần nhất
- Các card có thể click để chuyển nhanh sang trang quản lý tương ứng.

#### Quản lý sản phẩm

- Tìm kiếm.
- Lọc theo brand.
- Phân trang.
- Thêm sản phẩm.
- Sửa sản phẩm.
- Thêm/xóa size.
- Ẩn/hiện sản phẩm.
- Xóa sản phẩm.

#### Quản lý đơn hàng

- Lọc theo trạng thái.
- Tìm theo mã đơn.
- Phân trang.
- Cập nhật trạng thái đơn bằng custom dropdown.
- Xác nhận khi đổi sang bất kỳ trạng thái nào.
- Màu xác nhận theo từng trạng thái:
  - `pending`: vàng
  - `confirmed`: xanh dương
  - `shipping`: tím
  - `completed`: xanh lá
  - `cancelled`: đỏ
- Ghi nhận `completedAt` đúng logic khi chuyển sang trạng thái hoàn thành.
- Nút lưu thủ công đã được bỏ, cập nhật trực tiếp theo thao tác xác nhận.

#### Quản lý người dùng

- Tìm kiếm theo tên/email.
- Ẩn tài khoản admin khỏi bảng.
- Xem số đơn hàng của từng user (không tính đơn `cancelled`).
- Xem số lượng sản phẩm trong giỏ.
- Xem thông tin giao hàng.
- Xem nhanh danh sách đơn của từng user bằng modal.
- Khóa / mở khóa tài khoản.
- Xóa tài khoản.
- Nút khóa, mở khóa, xóa đều có xác nhận bằng `BaseConfirmModal`.

Khi khóa tài khoản:

- `isActive` của user sẽ bị chuyển thành `false`.
- User bị chặn đăng nhập ở lần kiểm tra tiếp theo.
- Các đơn đang `pending`, `confirmed`, `shipping` sẽ bị chuyển `cancelled`.
- Tồn kho của các đơn đó được hoàn lại.

#### Quản lý doanh thu

- Route riêng `/admin/revenue`.
- Lọc theo ngày.
- Lọc theo tháng.
- Lọc theo năm.
- Lọc theo khoảng ngày.
- Thống kê:
  - tổng doanh thu
  - số đơn hoàn thành
  - giá trị trung bình / đơn
  - đơn cao nhất
  - đơn thấp nhất
  - tổng sản phẩm đã bán
  - số đơn COD
  - số đơn chuyển khoản
- Bảng chi tiết doanh thu có cột số sản phẩm.
- Phân trang.
- Custom dropdown cho kiểu lọc.
- Xuất báo cáo doanh thu ra PDF.
- Nút xuất PDF có xác nhận bằng `BaseConfirmModal`.
- PDF đã dùng font custom để hiển thị tiếng Việt.

## Component dùng chung

Project hiện có một số component tái sử dụng ở `src/components/common`:

- `BaseConfirmModal.vue`
- `BasePagination.vue`
- `BaseSearchBox.vue`
- `BaseBrandFilter.vue`

`BaseConfirmModal` hiện đang được dùng ở nhiều luồng quan trọng như:

- đăng xuất client
- đăng xuất admin
- khóa user
- xóa user
- đổi trạng thái đơn hàng
- xuất PDF

## Kiến trúc và luồng hoạt động

### Xác thực và phân quyền

- Người dùng đăng nhập qua mock API `users`.
- Thông tin phiên hiện tại lưu ở `localStorage` với key `currentUser`.
- `router.beforeEach` kiểm tra:
  - route có cần đăng nhập hay không
  - user còn tồn tại và còn `isActive`
  - route admin chỉ cho `role = admin`

### Giỏ hàng

- Giỏ hàng được lưu theo từng user trong `users[].cart.items` của `db.json`.
- Ở trang chi tiết sản phẩm, thao tác thêm giỏ hàng ghi trực tiếp lên dữ liệu user qua API.
- Mỗi item giỏ hàng có dạng:
  - `productId`
  - `size`
  - `quantity`
  - `addedAt`

### Đơn hàng

- Khi checkout thành công:
  - tạo bản ghi mới trong `orders`
  - trừ tồn kho tương ứng trong `products[].sizes`
  - xóa giỏ hàng của user
- Các trạng thái đơn đang được dùng trong project:
  - `pending`
  - `confirmed`
  - `shipping`
  - `completed`
  - `cancelled`

### Doanh thu

- Chỉ tính các đơn có trạng thái `completed`.
- Biểu đồ và báo cáo doanh thu sử dụng `completedAt` làm mốc thống kê.

## Cấu trúc dữ liệu mock

File dữ liệu chính: `src/data/db.json`

### `products`

Mỗi sản phẩm gồm các trường chính:

- `id`
- `name`
- `brand`
- `isActive`
- `price`
- `image`
- `description`
- `sizes`

Trong đó `sizes` là mảng các object:

- `id`
- `size`
- `quantity`

### `users`

Mỗi user gồm các trường chính:

- `id`
- `name`
- `email`
- `password`
- `role`
- `isActive`
- `cart`
- `shippingInfo`

### `orders`

Mỗi đơn hàng gồm các trường chính:

- `id`
- `userId`
- `customerInfo`
- `paymentMethod`
- `items`
- `subtotal`
- `shippingFee`
- `totalAmount`
- `status`
- `createdAt`
- `completedAt` (nếu có)

## Cấu trúc thư mục

```text
src/
|-- assets/
|   |-- banners/               # ảnh banner trang chủ
|   |-- fonts/                 # font phục vụ xuất PDF
|   |-- sneakers/              # ảnh sản phẩm
|-- components/
|   |-- client/                # component khu vực shop
|   |-- common/                # component dùng chung
|-- data/
|   |-- db.json                # mock database cho json-server
|-- layouts/
|   |-- AdminLayout.vue
|   |-- ClientLayout.vue
|-- router/
|   |-- index.js               # route config + route guard
|-- services/
|-- utils/
|-- views/
|   |-- admin/                 # dashboard, products, orders, users, revenue
|   |-- client/                # home, login, register, cart, checkout, orders...
|-- App.vue
|-- main.js
```

## Các route chính

### Client

- `/` trang chủ
- `/product/:id` chi tiết sản phẩm
- `/login` đăng nhập
- `/register` đăng ký
- `/cart` giỏ hàng
- `/checkout` thanh toán
- `/orders` đơn hàng của người dùng
- `/profile` hồ sơ cá nhân

### Admin

- `/admin` dashboard
- `/admin/products` quản lý sản phẩm
- `/admin/orders` quản lý đơn hàng
- `/admin/users` quản lý người dùng
- `/admin/revenue` quản lý doanh thu

## Hướng dẫn cài đặt và chạy project

### 1. Yêu cầu môi trường

- Node.js 18+ khuyến nghị
- npm
- `json-server`

Lưu ý: trong `package.json`, script `npm run db` đang gọi trực tiếp lệnh `json-server`, nhưng package này hiện chưa được khai báo trong `dependencies/devDependencies`. Vì vậy cần cài global hoặc tự bổ sung vào project.

### 2. Cài dependencies

```bash
npm install
```

### 3. Cài `json-server` nếu máy chưa có

```bash
npm install -g json-server
```

### 4. Chạy mock API

```bash
npm run db
```

Mock API mặc định chạy tại:

```text
http://localhost:3000
```

### 5. Chạy frontend

Mở terminal khác:

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
npm run lint    # chạy eslint
npm run db      # chạy json-server với src/data/db.json
```

## Tài khoản mẫu

Tài khoản có sẵn trong dữ liệu mẫu:

### User

- Email: `vana@gmail.com`
- Password: `123456`

### Admin

- Email: `admin@gmail.com`
- Password: `admin123`

### Một số user khác trong dữ liệu

- `a@gmail.com` / `123456`
- `b@gmail.com` / `123456`
- `c@gmail.com` / `123456`
- `h@gmail.com` / `123456`

## Quy tắc nghiệp vụ đang áp dụng

- Chỉ user đăng nhập mới truy cập được giỏ hàng, checkout, hồ sơ và đơn hàng.
- Chỉ admin mới truy cập được `/admin`.
- Nếu user bị khóa (`isActive = false`), route guard sẽ xóa `currentUser` và chuyển về trang đăng nhập.
- Phí vận chuyển:
  - `0đ` nếu đơn từ `1.000.000đ` trở lên
  - `30.000đ` nếu thấp hơn mức đó
- Chức năng QR chuyển khoản hiện là mô phỏng frontend:
  - hiển thị ảnh QR từ dịch vụ ngoài
  - sau vài giây sẽ tự xác nhận như một thanh toán thành công giả lập

## Điểm cần lưu ý

- Đây là project frontend dùng mock API, chưa có backend thật.
- Chưa có JWT, refresh token, phân quyền server-side hoặc mã hóa mật khẩu.
- Dữ liệu đăng nhập đang lưu ở `localStorage`, chỉ phù hợp cho mục đích học tập và demo.
- Chức năng tạo QR phụ thuộc vào ảnh từ dịch vụ bên ngoài `api.qrserver.com`.
- Dữ liệu mock có thể bị thay đổi khi thao tác thêm/xóa/sửa trong quá trình test.

## Hướng phát triển thêm

- Tách state sang Pinia store thay vì xử lý phân tán trong component.
- Bổ sung validation mạnh hơn cho admin form sản phẩm.
- Thêm toast/loading/error handling đồng bộ toàn hệ thống.
- Tạo backend thật với xác thực và phân quyền chuẩn.
- Đồng bộ logic đơn hàng với lịch sử thay đổi trạng thái.
- Viết test cho các luồng quan trọng như checkout, hủy đơn, khóa user.
- Tối ưu responsive cho toàn bộ admin panel.

## License

Project phát hành theo giấy phép `MIT`. Xem chi tiết trong file `LICENSE`.