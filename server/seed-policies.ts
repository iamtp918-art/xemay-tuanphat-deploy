import * as db from "./db";

// Default policy seed data for Xe Máy Tuấn Phát
export const DEFAULT_POLICIES = [
  {
    title: "Chính Sách Bảo Hành",
    slug: "bao-hanh",
    type: "warranty" as const,
    sortOrder: 1,
    isActive: true,
    content: `<h2>Chính Sách Bảo Hành — Xe Máy Tuấn Phát</h2>

<h3>1. Thời gian bảo hành</h3>
<p>Tất cả xe máy cũ bán tại Xe Máy Tuấn Phát đều được <strong>bảo hành động cơ 6 tháng hoặc 3.000km</strong> (tùy điều kiện nào đến trước). Đối với xe tay ga cao cấp (SH, PCX, Airblade đời mới), thời gian bảo hành lên đến <strong>12 tháng</strong>.</p>

<h3>2. Phạm vi bảo hành</h3>
<ul>
<li>Động cơ (block máy, piston, bạc đạn)</li>
<li>Hộp số (bánh răng, trục sơ cấp, thứ cấp)</li>
<li>Hệ thống phun xăng điện tử (FI)</li>
<li>Hệ thống đánh lửa</li>
</ul>

<h3>3. Không thuộc phạm vi bảo hành</h3>
<ul>
<li>Hư hỏng do tai nạn, va chạm</li>
<li>Xe bị ngập nước, cháy nổ</li>
<li>Tự ý sửa chữa, thay đổi kết cấu tại cơ sở ngoài</li>
<li>Phụ tùng hao mòn tự nhiên: má phanh, nhông sên dĩa, lốp xe, bóng đèn</li>
<li>Hết thời hạn hoặc vượt quá số km bảo hành</li>
</ul>

<h3>4. Quy trình bảo hành</h3>
<ol>
<li>Liên hệ hotline <strong>0335.111.777</strong> để thông báo tình trạng xe</li>
<li>Mang xe đến cửa hàng kèm theo <strong>phiếu mua hàng / phiếu bảo hành</strong></li>
<li>Kỹ thuật viên kiểm tra và xác nhận lỗi thuộc phạm vi bảo hành</li>
<li>Tiến hành sửa chữa / thay thế miễn phí trong vòng 1-3 ngày làm việc</li>
</ol>

<h3>5. Địa điểm bảo hành</h3>
<p>Tại cửa hàng Xe Máy Tuấn Phát — Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai hoặc đơn vị bảo hành ủy quyền.</p>

<p><em>Mọi thắc mắc vui lòng liên hệ hotline <strong>0335.111.777</strong> để được hỗ trợ nhanh nhất.</em></p>`,
  },
  {
    title: "Chính Sách Trả Góp",
    slug: "tra-gop",
    type: "installment" as const,
    sortOrder: 2,
    isActive: true,
    content: `<h2>Chính Sách Trả Góp — Xe Máy Tuấn Phát</h2>

<h3>1. Điều kiện trả góp</h3>
<ul>
<li>Khách hàng <strong>từ 18 tuổi trở lên</strong></li>
<li>Không cần chứng minh thu nhập</li>
<li>Không cần người bảo lãnh (tùy hạn mức)</li>
<li>Trả trước <strong>từ 0 đồng</strong> (tùy xe và hạn mức tín dụng cá nhân)</li>
</ul>

<h3>2. Thời hạn và lãi suất</h3>
<table>
<thead><tr><th>Thời hạn vay</th><th>Lãi suất tham khảo</th></tr></thead>
<tbody>
<tr><td>6 tháng</td><td>Từ 0.69%/tháng</td></tr>
<tr><td>12 tháng</td><td>Từ 0.89%/tháng</td></tr>
<tr><td>18 tháng</td><td>Từ 0.99%/tháng</td></tr>
<tr><td>24 tháng</td><td>Từ 1.09%/tháng</td></tr>
<tr><td>36 tháng</td><td>Từ 1.19%/tháng</td></tr>
</tbody>
</table>
<p><em>Lãi suất có thể thay đổi theo từng thời kỳ và chính sách của ngân hàng/công ty tài chính đối tác.</em></p>

<h3>3. Đối tác tài chính</h3>
<ul>
<li>FE Credit</li>
<li>HD Saison</li>
<li>Mcredit</li>
<li>VPBank</li>
<li>Techcombank</li>
</ul>

<h3>4. Thủ tục cần chuẩn bị</h3>
<ul>
<li>CMND/CCCD (bản gốc)</li>
<li>Hộ khẩu hoặc KT3 (bản gốc hoặc sao y)</li>
<li>Không cần sổ đỏ, không cần bằng lái</li>
</ul>

<h3>5. Thời gian duyệt hồ sơ</h3>
<p>Từ <strong>30 phút đến 2 giờ</strong> làm việc. Kết quả được thông báo ngay tại cửa hàng.</p>

<h3>6. Quy trình trả góp</h3>
<ol>
<li>Chọn xe và thỏa thuận giá</li>
<li>Cung cấp giấy tờ, điền đơn xin vay</li>
<li>Chờ duyệt hồ sơ (30 phút - 2 giờ)</li>
<li>Ký hợp đồng trả góp</li>
<li>Nhận xe và phiếu bảo hành</li>
</ol>

<p><em>Liên hệ <strong>0335.111.777</strong> để được tư vấn gói trả góp phù hợp nhất.</em></p>`,
  },
  {
    title: "Chính Sách Đổi Trả",
    slug: "doi-tra",
    type: "return" as const,
    sortOrder: 3,
    isActive: true,
    content: `<h2>Chính Sách Đổi Trả — Xe Máy Tuấn Phát</h2>

<h3>1. Điều kiện đổi xe</h3>
<p>Khách hàng được <strong>đổi xe trong vòng 48 giờ</strong> kể từ thời điểm giao xe nếu phát hiện lỗi từ phía cửa hàng:</p>
<ul>
<li>Lỗi kỹ thuật ẩn (động cơ, hộp số, hệ thống điện)</li>
<li>Xe không đúng mô tả đã cam kết khi bán</li>
<li>Đồng hồ công tơ mét bị can thiệp (nếu có bằng chứng)</li>
</ul>

<h3>2. Không hỗ trợ đổi trả khi</h3>
<ul>
<li>Khách hàng thay đổi ý định mua</li>
<li>Xe đã đi quá 50km sau khi giao dịch</li>
<li>Xe bị hư hỏng do sử dụng sai cách sau khi mua</li>
<li>Không còn đầy đủ giấy tờ bàn giao ban đầu</li>
</ul>

<h3>3. Điều kiện xe khi đổi trả</h3>
<ul>
<li>Xe còn nguyên vẹn, không trầy xước thêm</li>
<li>Còn đầy đủ phụ kiện, giấy tờ bàn giao</li>
<li>Còn phiếu mua hàng / hóa đơn</li>
</ul>

<h3>4. Quy trình đổi trả</h3>
<ol>
<li>Liên hệ hotline <strong>0335.111.777</strong> ngay khi phát hiện lỗi</li>
<li>Mang xe đến cửa hàng kèm phiếu mua hàng</li>
<li>Kỹ thuật viên kiểm tra và xác nhận lỗi</li>
<li>Đổi xe tương đương hoặc hoàn tiền (tùy thỏa thuận)</li>
</ol>

<h3>5. Thời gian xử lý</h3>
<p>Trong vòng <strong>3 ngày làm việc</strong> kể từ ngày tiếp nhận yêu cầu.</p>

<p><em>Xe Máy Tuấn Phát cam kết bảo vệ quyền lợi khách hàng. Liên hệ <strong>0335.111.777</strong> để được hỗ trợ.</em></p>`,
  },
  {
    title: "Chính Sách Bảo Mật Thông Tin",
    slug: "bao-mat",
    type: "privacy" as const,
    sortOrder: 4,
    isActive: true,
    content: `<h2>Chính Sách Bảo Mật Thông Tin — Xe Máy Tuấn Phát</h2>

<h3>1. Mục đích thu thập thông tin</h3>
<p>Xe Máy Tuấn Phát thu thập thông tin cá nhân (họ tên, số điện thoại, địa chỉ) nhằm mục đích:</p>
<ul>
<li>Liên hệ tư vấn và hỗ trợ khách hàng</li>
<li>Xử lý giao dịch mua bán xe</li>
<li>Hỗ trợ thủ tục trả góp, sang tên</li>
<li>Thông báo chương trình khuyến mãi (nếu khách hàng đồng ý)</li>
</ul>

<h3>2. Cam kết bảo mật</h3>
<ul>
<li><strong>Không chia sẻ, bán</strong> thông tin khách hàng cho bất kỳ bên thứ ba nào</li>
<li>Chỉ sử dụng thông tin cho mục đích đã nêu ở trên</li>
<li>Nhân viên tiếp cận thông tin phải tuân thủ quy định bảo mật nội bộ</li>
</ul>

<h3>3. Bảo mật dữ liệu</h3>
<ul>
<li>Dữ liệu được lưu trữ an toàn trên hệ thống có mã hóa</li>
<li>Giới hạn quyền truy cập nội bộ theo vai trò</li>
<li>Thường xuyên kiểm tra và cập nhật biện pháp bảo mật</li>
</ul>

<h3>4. Quyền của khách hàng</h3>
<ul>
<li>Yêu cầu <strong>xem, chỉnh sửa, xóa</strong> thông tin cá nhân bất kỳ lúc nào</li>
<li>Từ chối nhận thông báo quảng cáo</li>
<li>Khiếu nại nếu phát hiện thông tin bị sử dụng sai mục đích</li>
</ul>

<h3>5. Cookie</h3>
<p>Website sử dụng cookie để cải thiện trải nghiệm người dùng. Cookie <strong>không theo dõi thông tin cá nhân</strong> và có thể được tắt trong cài đặt trình duyệt.</p>

<h3>6. Liên hệ</h3>
<p>Để yêu cầu xóa dữ liệu hoặc thắc mắc về chính sách bảo mật, vui lòng liên hệ:</p>
<ul>
<li>Hotline: <strong>0335.111.777</strong></li>
<li>Địa chỉ: Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai</li>
</ul>`,
  },
  {
    title: "Điều Khoản Sử Dụng",
    slug: "dieu-khoan",
    type: "terms" as const,
    sortOrder: 5,
    isActive: true,
    content: `<h2>Điều Khoản Sử Dụng — Xe Máy Tuấn Phát</h2>

<h3>1. Phạm vi áp dụng</h3>
<p>Điều khoản này áp dụng cho tất cả khách hàng truy cập website và giao dịch tại cửa hàng Xe Máy Tuấn Phát. Khi sử dụng dịch vụ, khách hàng đồng ý tuân thủ các điều khoản dưới đây.</p>

<h3>2. Quyền và nghĩa vụ của khách hàng</h3>
<ul>
<li>Được cung cấp thông tin chính xác về xe trước khi mua</li>
<li>Được kiểm tra xe thực tế tại cửa hàng</li>
<li>Được hưởng các chính sách bảo hành, đổi trả theo quy định</li>
<li>Có nghĩa vụ cung cấp thông tin trung thực khi giao dịch</li>
<li>Tuân thủ quy trình mua bán và thanh toán của cửa hàng</li>
</ul>

<h3>3. Quyền và nghĩa vụ của cửa hàng</h3>
<ul>
<li>Cung cấp thông tin xe trung thực, chính xác nhất có thể</li>
<li>Hỗ trợ khách hàng trong quá trình mua bán, trả góp, sang tên</li>
<li>Thực hiện đầy đủ cam kết bảo hành, đổi trả</li>
<li>Bảo mật thông tin khách hàng theo chính sách bảo mật</li>
</ul>

<h3>4. Giới hạn trách nhiệm</h3>
<ul>
<li>Thông tin xe trên website mang tính tham khảo, khuyến nghị khách hàng kiểm tra thực tế trước khi quyết định</li>
<li>Giá xe có thể thay đổi mà không cần thông báo trước</li>
<li>Cửa hàng không chịu trách nhiệm cho hư hỏng phát sinh sau khi hết thời hạn bảo hành</li>
</ul>

<h3>5. Giải quyết tranh chấp</h3>
<p>Mọi tranh chấp phát sinh sẽ được giải quyết qua <strong>thương lượng trực tiếp</strong> giữa hai bên. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra <strong>cơ quan có thẩm quyền tại tỉnh Đồng Nai</strong> để giải quyết.</p>

<h3>6. Sửa đổi điều khoản</h3>
<p>Xe Máy Tuấn Phát có quyền sửa đổi điều khoản sử dụng và sẽ <strong>thông báo trước 7 ngày</strong> qua website trước khi áp dụng.</p>

<h3>7. Luật áp dụng</h3>
<p>Các điều khoản này được điều chỉnh bởi <strong>pháp luật Việt Nam</strong>.</p>`,
  },
  {
    title: "Hướng Dẫn Mua Xe",
    slug: "huong-dan-mua",
    type: "guide" as const,
    sortOrder: 6,
    isActive: true,
    content: `<h2>Hướng Dẫn Mua Xe — Xe Máy Tuấn Phát</h2>

<h3>Bước 1: Chọn xe phù hợp</h3>
<p>Bạn có thể xem xe trực tiếp trên website hoặc liên hệ hotline <strong>0335.111.777</strong> để được tư vấn. Nhân viên sẽ giúp bạn chọn xe phù hợp với nhu cầu sử dụng và ngân sách.</p>

<h3>Bước 2: Kiểm tra xe thực tế</h3>
<p>Đến trực tiếp cửa hàng tại <strong>Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai</strong> để:</p>
<ul>
<li>Xem xe thực tế, kiểm tra ngoại hình</li>
<li>Nổ máy, nghe tiếng động cơ</li>
<li>Chạy thử xe (có nhân viên hướng dẫn)</li>
<li>Kiểm tra giấy tờ xe</li>
</ul>

<h3>Bước 3: Thỏa thuận giá và hình thức thanh toán</h3>
<p>Sau khi chọn được xe ưng ý, bạn và cửa hàng sẽ thỏa thuận giá cuối cùng. Các hình thức thanh toán:</p>
<ul>
<li><strong>Tiền mặt:</strong> Thanh toán trực tiếp tại cửa hàng</li>
<li><strong>Chuyển khoản:</strong> Qua tài khoản ngân hàng của cửa hàng</li>
<li><strong>Trả góp:</strong> Hỗ trợ trả góp từ 0 đồng trả trước (xem <a href="/chinh-sach/tra-gop">Chính sách trả góp</a>)</li>
</ul>

<h3>Bước 4: Ký hợp đồng và nhận phiếu bảo hành</h3>
<ul>
<li>Ký hợp đồng mua bán (2 bản, mỗi bên giữ 1 bản)</li>
<li>Nhận phiếu bảo hành ghi rõ thời hạn và phạm vi</li>
<li>Nhận biên lai thanh toán</li>
</ul>

<h3>Bước 5: Bàn giao xe và giấy tờ</h3>
<p>Cửa hàng bàn giao đầy đủ:</p>
<ul>
<li>Xe máy đã được vệ sinh, kiểm tra lần cuối</li>
<li>Cà vẹt (giấy đăng ký xe)</li>
<li>Hợp đồng mua bán</li>
<li>Phiếu bảo hành</li>
</ul>

<h3>Giấy tờ cần chuẩn bị</h3>
<ul>
<li><strong>CCCD/CMND</strong> (bản gốc)</li>
<li>Hộ khẩu hoặc KT3 (nếu mua trả góp)</li>
</ul>

<h3>Hỗ trợ sang tên</h3>
<p>Cửa hàng hỗ trợ làm thủ tục <strong>sang tên nhanh chóng trong ngày</strong>. Phí sang tên theo quy định nhà nước, cửa hàng hỗ trợ toàn bộ thủ tục giấy tờ.</p>

<p><em>Liên hệ <strong>0335.111.777</strong> hoặc đến trực tiếp cửa hàng để được tư vấn miễn phí.</em></p>`,
  },
];

export async function seedPolicies() {
  console.log("[Seed] Seeding policies...");
  try {
    const existing = await db.listPolicies(false);
    
    for (const policy of DEFAULT_POLICIES) {
      const found = existing.find((p: any) => p.slug === policy.slug);
      if (!found) {
        try {
          await db.createPolicy(policy as any);
          console.log(`[Seed] Created policy: ${policy.title}`);
        } catch (e: any) {
          // Might be duplicate slug error, try update instead
          console.log(`[Seed] Policy ${policy.slug} may already exist, skipping create`);
        }
      } else {
        // Update existing policy content
        try {
          await db.updatePolicy(found.id, {
            title: policy.title,
            content: policy.content,
            type: policy.type as any,
            sortOrder: policy.sortOrder,
            isActive: policy.isActive,
          });
          console.log(`[Seed] Updated policy: ${policy.title}`);
        } catch (e: any) {
          console.log(`[Seed] Failed to update policy ${policy.title}:`, e.message);
        }
      }
    }
    console.log("[Seed] Policies seeded successfully");
  } catch (err: any) {
    console.error("[Seed] Error seeding policies:", err.message);
  }
}
