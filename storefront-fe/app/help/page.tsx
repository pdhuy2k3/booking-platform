'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, HelpCircle } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      question: "Làm thế nào để đặt chuyến bay hoặc khách sạn?",
      answer: "Bạn có thể sử dụng giao diện trò chuyện AI của chúng tôi để tìm kiếm và đặt chỗ. Chỉ cần nhập yêu cầu của bạn, ví dụ: 'Tìm chuyến bay từ Hà Nội đến TP.HCM vào ngày mai' hoặc 'Tìm khách sạn ở Đà Nẵng cho 2 người trong 3 đêm'. Ngoài ra, bạn có thể sử dụng luồng đặt chỗ truyền thống bằng cách nhấp vào tab 'Tìm kiếm' và tự mình điền vào các biểu mẫu."
    },
    {
      question: "Làm thế nào để xem lại lịch sử đặt chỗ của tôi?",
      answer: "Sau khi đăng nhập, bạn có thể nhấp vào ảnh đại diện của mình ở góc dưới cùng bên trái và chọn 'Lịch sử đặt chỗ' để xem tất cả các chuyến đi trước đây và sắp tới của bạn."
    },
    {
      question: "Tôi có thể hủy hoặc thay đổi đặt chỗ của mình không?",
      answer: "Chính sách hủy và thay đổi tùy thuộc vào nhà cung cấp (hãng hàng không hoặc khách sạn). Vui lòng kiểm tra chi tiết chính sách trong email xác nhận đặt chỗ của bạn."
    },
    {
      question: "Làm thế nào để liên hệ hỗ trợ khách hàng?",
      answer: "Nếu bạn cần hỗ trợ, vui lòng gửi email cho chúng tôi tại support@bookingsmart.com hoặc gọi đến đường dây nóng của chúng tôi theo số 1-800-123-4567."
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Trung tâm Trợ giúp</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Chúng tôi ở đây để giúp bạn. Tìm câu trả lời cho câu hỏi của bạn dưới đây.</p>
      </header>

      <div className="space-y-12">
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              <span>Câu hỏi thường gặp (FAQ)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Privacy Policy Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span>Chính sách Bảo mật</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Chính sách Bảo mật này mô tả cách BookingSmart thu thập, sử dụng và tiết lộ thông tin của bạn. Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý với việc thu thập, lưu trữ, xử lý và chuyển giao thông tin của bạn như được mô tả trong chính sách này.</p>
            <h4>1. Thông tin chúng tôi thu thập</h4>
            <p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, đặt chỗ hoặc liên hệ với bộ phận hỗ trợ khách hàng. Thông tin này có thể bao gồm tên, email, số điện thoại và chi tiết thanh toán của bạn.</p>
            <h4>2. Cách chúng tôi sử dụng thông tin của bạn</h4>
            <p>Chúng tôi sử dụng thông tin của bạn để cung cấp và cải thiện dịch vụ của mình, xử lý các giao dịch, giao tiếp với bạn và cá nhân hóa trải nghiệm của bạn.</p>
            <h4>3. Chia sẻ thông tin</h4>
            <p>Chúng tôi có thể chia sẻ thông tin của bạn với các nhà cung cấp bên thứ ba, chẳng hạn như hãng hàng không và khách sạn, để hoàn tất việc đặt chỗ của bạn. Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.</p>
          </CardContent>
        </Card>

        {/* Terms of Service Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Điều khoản Dịch vụ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Chào mừng bạn đến với BookingSmart. Bằng cách truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các điều khoản và điều kiện này.</p>
            <h4>1. Sử dụng Dịch vụ</h4>
            <p>Bạn phải ít nhất 18 tuổi để sử dụng dịch vụ của chúng tôi. Bạn đồng ý cung cấp thông tin chính xác và đầy đủ và bạn chịu trách nhiệm cho tất cả các hoạt động xảy ra trong tài khoản của mình.</p>
            <h4>2. Đặt chỗ và Thanh toán</h4>
            <p>Tất cả các đặt chỗ đều phải có sẵn. Bạn đồng ý thanh toán tất cả các khoản phí và thuế áp dụng cho các giao dịch của mình.</p>
            <h4>3. Giới hạn Trách nhiệm</h4>
            <p>BookingSmart không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc bạn sử dụng dịch vụ của chúng tôi.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
