/**
 * What the Wulong day costs, what has to be done before it, and what is still
 * unverified. Gathered on 30/8/2026 from the city government, the railway
 * operator, the Wulong tourism board and traveller reports; every claim keeps
 * the source it came from.
 */

export type GuideFact = { label: string; value: string };
export type GuideCheck = { title: string; detail: string };
export type GuideSource = { label: string; url: string };

export const WULONG_GUIDE = {
  date: "31/08/2026",
  headline: "Vũ Long trong ngày",
  hotline: "4000235666",
  featured: {
    label: "Nhật ký chuyến đi tháng 5/2026 của một khách Việt",
    url: "https://sweetiesandrose.wordpress.com/2026/05/18/cach-di-cong-vien-%e6%ad%a6%e9%9a%86-wulong-tu-trung-khanh/",
    note: "Bài gốc, đọc trước khi đi.",
  } satisfies GuideSource & { note: string },
  trains: [
    {
      label: "Chiều đi",
      value: "G2427 · Trùng Khánh Đông 08:08 → Vũ Long Nam 08:43 · 35 phút · ¥80",
    },
    {
      label: "Chiều về",
      value: "G8604 · Vũ Long Nam 18:33 → Trùng Khánh Đông 19:18 · 45 phút · ¥72",
    },
    {
      label: "Chuyến về dự phòng",
      value: "G8504 21:03 hoặc G3870 21:25, cùng về Trùng Khánh Đông",
    },
    {
      label: "Ga đến",
      value: "武隆南站 (Vũ Long Nam), không phải 武隆站. Ga 武隆北 không tồn tại",
    },
  ] satisfies GuideFact[],
  tickets: [
    {
      label: "Thiên Sinh Tam Kiều",
      value: "¥155 mùa cao điểm, đã gồm xe trung chuyển ¥40 và thang xoay ¥45",
    },
    {
      label: "Long Thủy Hiệp Địa Phùng",
      value: "¥105 mùa cao điểm, đã gồm xe trung chuyển ¥35 và thang máy ¥15",
    },
    {
      label: "Đặt trước",
      value: "Mini program 武隆景区官方平台 hoặc 武隆旅游, rẻ hơn tại chỗ ¥20-30",
    },
    {
      label: "Trả thêm tại chỗ",
      value: "Xe điện ¥15 ở cửa ra Tam Kiều (tự nguyện), đài kính ¥25",
    },
    {
      label: "Giờ mở cửa",
      value: "08:00-17:00. Ngày 31/8 là ngày cuối giờ hè, từ 1/9 đổi 08:30-16:30",
    },
    {
      label: "Xe buýt lên núi",
      value:
        "¥16 một chiều từ ga Vũ Long Nam tới trung tâm du khách, mua riêng, không nằm trong vé khu",
    },
  ] satisfies GuideFact[],
  checklist: [
    {
      title: "Mua vé tàu",
      detail:
        "31/8 là ngày cuối cao điểm hè, vé bán rất nhanh. Chuyến 07:17 chỉ còn 2 ghế khi tra ngày 30/8.",
    },
    {
      title: "Xác minh hộ chiếu trên 12306",
      detail:
        "Cổng tự động không đọc hộ chiếu nước ngoài, phải qua làn 人工通道. Xác minh trước để khỏi xếp hàng ở quầy.",
    },
    {
      title: "Đặt vé hai khu trên mini program",
      detail: "Rẻ hơn mua tại quầy và khỏi xếp hàng ở trung tâm du khách.",
    },
    {
      title: "Sáng ra ga kiểm tra cảnh báo mưa",
      detail:
        "Hai khu từng đóng vì mưa lũ ngày 7/6/2026 và mở lại sáng hôm sau. Ngày 29/8 có cảnh báo mưa vàng cho vùng Tiên Nữ Sơn.",
    },
  ] satisfies GuideCheck[],
  confirm: [
    {
      title: "Giờ vào cuối",
      detail:
        "Nguồn ghi 16:00, nguồn khác 16:30, và 31/8 đúng ngày chuyển mùa giờ.",
    },
    {
      title: "Lối ra Địa Phùng",
      detail:
        "Trang chính thức vẫn treo thông báo từ 2020 nói phải quay lại bằng thang máy, trong khi các nguồn 2022-2026 nói có xe đón ở cửa ra. Khác nhau ở chỗ có phải leo ngược 508 bậc hay không.",
    },
    {
      title: "Giờ chuyến xe cuối",
      detail:
        "Ở cửa ra Địa Phùng và xe về ga. Các số tìm được là 17:00, 17:30, 18:30, có nguồn từ 2019.",
    },
    {
      title: "Tuyến 仙女山星旅游专线",
      detail: "Chỉ biết chạy 07:00-20:00 từ ga cao tốc. Giá và giãn cách chưa rõ.",
    },
  ] satisfies GuideCheck[],
  risks: [
    {
      title: "Xếp hàng thang máy Tam Kiều",
      detail:
        "Có thể hơn một tiếng vào cao điểm. Nếu quá, bỏ Địa Phùng hoặc đổi sang chuyến tàu muộn.",
    },
    {
      title: "Ga Trùng Khánh Đông có 8 tầng",
      detail: "Chừa 30-40 phút cho an ninh và đi bộ trong ga. Soát vé đóng 3-7 phút trước giờ chạy.",
    },
    {
      title: "Định vị dễ sai",
      detail:
        "Phải trỏ đúng 武隆仙女山游客中心 ở 银杏大道. Cổng cũ đã đóng từ 2023, nhập tên chung chung có thể bị dẫn thêm 30 km đường núi.",
    },
    {
      title: "Lối đi trong Địa Phùng trơn",
      detail: "Sàn gỗ ẩm và rêu quanh năm, 508 bậc, đoạn hẹp chỉ vừa một người.",
    },
  ] satisfies GuideCheck[],
  fromTravellers: [
    {
      title: "Vé hai khu mua gộp ¥260",
      detail:
        "Khách Việt đi tháng 5/2026 mua trước trên trip.com, khỏi xếp hàng và tiện cho hộ chiếu nước ngoài. Con số này khớp với ¥155 cộng ¥105 theo bảng giá chính thức.",
    },
    {
      title: "Xếp hàng thang máy 30-40 phút",
      detail:
        "Đo thực tế vào giờ cao điểm tháng 5/2026, thấp hơn mức hơn một tiếng mà các bài cũ mô tả.",
    },
    {
      title: "Đi bộ khoảng 3 km trong Tam Kiều",
      detail: "Ra khỏi cửa soát vé đi một đoạn tới thang máy, xuống thang rồi men đường núi tới khu thôn cổ.",
    },
    {
      title: "Mang theo",
      detail: "Đồ ăn, nước, giày đi bộ, ô, kem chống nắng, mũ.",
    },
  ] satisfies GuideCheck[],
  sources: [
    {
      label: "Cục Đường sắt Quốc gia, tuyến Trùng Khánh Đông đến Kiềm Giang",
      url: "https://www.nra.gov.cn/xwzx/tpsp/tpxx/202506/t20250627_349123.shtml",
    },
    {
      label: "Tra vé ngày 31/8, chiều đi",
      url: "https://train.qunar.com/train/tickets/chongqingdong-to-wulongnan/2026-08-31",
    },
    {
      label: "Tra vé ngày 31/8, chiều về",
      url: "https://train.qunar.com/train/tickets/wulongnan-to-chongqingdong/2026-08-31",
    },
    {
      label: "Bảng giá vé chính thức khu du lịch Vũ Long",
      url: "http://www.wlkst.com/pjdq.jhtml",
    },
    {
      label: "Thông báo giờ mở cửa theo mùa",
      url: "https://www.wlkst.com/wlxw/20220510/26024.html",
    },
    {
      label: "12306, giấy tờ tại cổng soát vé",
      url: "https://www.12306.cn/mormhweb/zxdt/202006/t20200619_31186.html",
    },
    {
      label: "Hai khu đóng vì mưa lũ 7/6/2026 và mở lại 8/6",
      url: "https://www.wlkst.com/wlxw/27875.jhtml",
    },
  ] satisfies GuideSource[],
} as const;
