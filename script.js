/* =========================================================
   Trace & Think: Front-end prototype logic
   ---------------------------------------------------------
   1. Translations (EN / VI)
   2. Sample data (themes, sources, evidence, connections)
   3. Referencing (the RMIT Easy Cite styles)
   4. State + persistence (localStorage)
   5. Helpers
   6. Router & shell
   7. Landing page
   8. App page renderers
   9. Onboarding tour
   10. Event handling
   All "AI" output is mocked. No backend is used.
   ========================================================= */
(() => {
  'use strict';

  const STORAGE_KEY = 'traceThink.state';
  const STATE_VERSION = 5;
  const HOUR = 36e5;
  const DAY = 24 * HOUR;

  /* ------------------------------------------------------
     1. TRANSLATIONS: each key holds [English, Vietnamese]
     ------------------------------------------------------ */
  const STR = {
    // Shell
    'brand.tagline': ['Research with clarity', 'Nghiên cứu rõ ràng'],
    'nav.workspace': ['Workspace', 'Chung'],
    'nav.flow': ['Research steps', 'Các bước nghiên cứu'],
    'nav.account': ['Account', 'Tài khoản'],
    'nav.dashboard': ['Dashboard', 'Trang chính'],
    'nav.projects': ['My Projects', 'Dự án của tôi'],
    'nav.evidence': ['Evidence Library', 'Kho trích dẫn'],
    'nav.map': ['Insight Map', 'Sơ đồ ý tưởng'],
    'nav.builder': ['Argument Builder', 'Dàn ý'],
    'nav.settings': ['Settings', 'Cài đặt'],
    'nav.intro': ['About Trace & Think', 'Giới thiệu'],
    'nav.newProject': ['New project', 'Tạo dự án'],
    'top.currentProject': ['Current project', 'Dự án hiện tại'],
    'top.search': ['Search your sources…', 'Tìm trong tài liệu…'],
    'top.help': ['Show me around', 'Xem hướng dẫn'],
    'top.menu': ['Open menu', 'Mở menu'],
    'top.noProject': ['No project yet', 'Chưa có dự án'],
    'side.active': ['Working on', 'Dự án hiện tại'],
    'side.stages': ['{n} of 4 steps', 'Đã xong {n}/4 bước'],
    'user.guest': ['Student', 'Sinh viên'],

    // Common
    'common.cancel': ['Cancel', 'Huỷ'],
    'common.close': ['Close', 'Đóng'],
    'common.edit': ['Edit', 'Sửa'],
    'common.viewAll': ['See all', 'Xem tất cả'],
    'common.sources': ['{n} sources', '{n} tài liệu'],
    'common.source1': ['1 source', '1 tài liệu'],
    'common.evCards': ['{n} saved quotes', '{n} đoạn trích đã lưu'],
    'common.edited': ['Edited {t}', 'Cập nhật {t}'],
    'common.active': ['Open', 'Đang mở'],
    'common.page': ['p. {n}', 'tr. {n}'],
    'common.clearFilters': ['Clear filters', 'Xoá bộ lọc'],

    // Time
    'time.now': ['just now', 'vừa xong'],
    'time.min': ['{n} min ago', '{n} phút trước'],
    'time.hour': ['an hour ago', '1 giờ trước'],
    'time.hours': ['{n} hours ago', '{n} giờ trước'],
    'time.yesterday': ['yesterday', 'hôm qua'],
    'time.days': ['{n} days ago', '{n} ngày trước'],

    // Dashboard
    'dash.morning': ['Good morning', 'Chào buổi sáng'],
    'dash.afternoon': ['Good afternoon', 'Chào buổi chiều'],
    'dash.evening': ['Good evening', 'Chào buổi tối'],
    'dash.sub': ['Pick up where you left off, or start something new.', 'Bạn có thể tiếp tục dự án đang làm hoặc bắt đầu một dự án mới.'],
    'dash.create': ['New project', 'Tạo dự án'],
    'dash.statProjects': ['Projects', 'Dự án'],
    'dash.statSources': ['PDFs', 'Tài liệu PDF'],
    'dash.statEvidence': ['Saved quotes', 'Đoạn trích đã lưu'],
    'dash.statSections': ['Outline sections', 'Ý trong dàn ý'],
    'dash.continue': ['Keep going', 'Tiếp tục'],
    'dash.noQuestion': ['You haven’t written a research question yet.', 'Bạn chưa nhập câu hỏi nghiên cứu.'],
    'dash.complete': ['{n}% done', 'Hoàn thành {n}%'],
    'dash.step': ['Step {n}', 'Bước {n}'],
    'dash.s1': ['Add your PDFs', 'Thêm tài liệu PDF'],
    'dash.s1m': ['{n} added', 'Đã thêm {n} tài liệu'],
    'dash.s2': ['Save quotes', 'Lưu đoạn trích'],
    'dash.s2m': ['{n} saved', 'Đã lưu {n} đoạn'],
    'dash.s3': ['Map the ideas', 'Sắp xếp ý tưởng'],
    'dash.s3m': ['{a} themes, {b} links', '{a} chủ đề, {b} liên kết'],
    'dash.s3w': ['Not yet', 'Chưa bắt đầu'],
    'dash.s4': ['Write the outline', 'Viết dàn ý'],
    'dash.s4m': ['{n} sections', '{n} ý'],
    'dash.s4w': ['Not yet', 'Chưa bắt đầu'],
    'dash.recent': ['Recent projects', 'Dự án gần đây'],
    'dash.activity': ['Recent activity', 'Hoạt động gần đây'],
    'dash.noActivity': ['Nothing here yet.', 'Chưa có hoạt động nào.'],
    'dash.newHere': ['First time here? There’s a quick walkthrough, about a minute.', 'Nếu bạn mới dùng lần đầu, phần hướng dẫn nhanh chỉ mất khoảng một phút.'],
    'dash.startTour': ['Show me', 'Xem hướng dẫn'],

    // Empty account
    'np.title': ['No projects yet', 'Bạn chưa có dự án nào'],
    'np.sub': ['Make a project for your assignment, add the PDFs you’re reading, and start asking them questions.', 'Hãy tạo một dự án cho bài tập, thêm các tài liệu PDF bạn đang đọc, sau đó đặt câu hỏi để tìm thông tin trong đó.'],

    // Projects
    'proj.sub': ['One project per assignment. Each keeps its own PDFs, quotes, map and outline.', 'Mỗi bài tập nên có một dự án riêng. Mỗi dự án lưu tài liệu, đoạn trích, sơ đồ và dàn ý của riêng nó.'],
    'proj.new': ['New project', 'Tạo dự án'],
    'proj.search': ['Search projects…', 'Tìm dự án…'],
    'proj.createCard': ['New project', 'Tạo dự án'],
    'proj.noMatch': ['Nothing matches “{q}”', 'Không có dự án nào khớp với “{q}”'],
    'proj.tryOther': ['Try another word.', 'Bạn hãy thử một từ khoá khác.'],
    'proj.noQuestion': ['No research question yet.', 'Chưa có câu hỏi nghiên cứu.'],
    'proj.delete': ['Delete project', 'Xoá dự án'],
    'proj.confirmDelete': ['Delete “{t}”? Its PDFs, saved quotes, map and outline will be removed from this browser.', 'Bạn có chắc muốn xoá “{t}”? Tài liệu, đoạn trích, sơ đồ và dàn ý của dự án này sẽ bị xoá khỏi trình duyệt.'],
    'proj.deleted': ['Project deleted', 'Đã xoá dự án'],
    'proj.switched': ['Now working on {t}', 'Đã chuyển sang dự án {t}'],

    // Evidence library
    'lib.sub': ['Ask your PDFs a question or search them. Keep the quotes you need, each one tied to its file and page.', 'Bạn có thể đặt câu hỏi hoặc tìm kiếm trong các tài liệu PDF. Mỗi đoạn trích bạn lưu đều ghi rõ tên tài liệu và số trang.'],
    'lib.addPdf': ['Add PDF', 'Thêm PDF'],
    'lib.refList': ['Reference list', 'Danh mục tham khảo'],
    'lib.realNotice': ['Your PDFs are read here in the browser and never leave your computer. Scanned pages are read with OCR.', 'Tài liệu PDF được đọc ngay trên trình duyệt và không được gửi đến máy chủ nào. Với trang scan, web dùng công nghệ OCR để nhận dạng chữ.'],
    'lib.sources': ['Your PDFs', 'Tài liệu PDF'],
    'lib.allSources': ['All files', 'Tất cả tài liệu'],
    'lib.allSourcesSub': ['Search everything', 'Tìm trong mọi tài liệu'],
    'lib.upload': ['Add PDFs', 'Thêm PDF'],
    'lib.ask': ['Ask your PDFs', 'Đặt câu hỏi'],
    'lib.askSub': ['You’ll get the sentences from your files that answer it best, with page numbers.', 'Web sẽ trích những câu trong tài liệu trả lời sát nhất với câu hỏi, kèm số trang.'],
    'lib.askPh': ['e.g. How did wayang kulit influence Indonesian culture?', 'Ví dụ: How did wayang kulit influence Indonesian culture?'],
    'lib.askBtn': ['Ask', 'Hỏi'],
    'lib.results': ['Results', 'Kết quả'],
    'lib.saved': ['Saved', 'Đã lưu'],
    'lib.searchPh': ['Search inside your PDFs…', 'Tìm trong tài liệu PDF…'],
    'lib.allThemes': ['All themes', 'Tất cả chủ đề'],
    'lib.showing': ['{n} quotes', '{n} đoạn trích'],
    'lib.showing1': ['1 quote', '1 đoạn trích'],
    'lib.noneSaved': ['Nothing saved yet', 'Bạn chưa lưu đoạn trích nào'],
    'lib.noneSavedSub': ['When you find a useful passage, hit Save and it shows up here.', 'Khi tìm thấy đoạn hữu ích, bạn bấm Lưu để đoạn đó xuất hiện ở đây.'],
    'lib.noMatch': ['No matches', 'Không tìm thấy kết quả'],
    'lib.noMatchSub': ['Try other words, or the names and terms your readings use.', 'Bạn hãy thử từ khoá khác, hoặc dùng tên riêng và thuật ngữ có trong tài liệu.'],
    'lib.startT': ['Search inside your PDFs', 'Tìm trong tài liệu PDF'],
    'lib.startS': ['Ask a question above or type a few keywords. Matching passages show up here with page numbers.', 'Bạn hãy đặt câu hỏi ở trên hoặc nhập vài từ khoá. Các đoạn phù hợp sẽ hiện ở đây kèm số trang.'],
    'lib.noTextT': ['No readable PDFs yet', 'Chưa có tài liệu nào đọc được'],
    'lib.noTextS': ['Add the PDFs for this assignment. Normal PDFs take a few seconds, scanned ones a bit longer.', 'Bạn hãy thêm tài liệu PDF cho bài tập này. Tài liệu thông thường được đọc trong vài giây, tài liệu scan sẽ mất thêm thời gian.'],
    'lib.thinking': ['Looking through {n} files…', 'Đang tìm trong {n} tài liệu…'],
    'lib.pdfAnswer': ['From your PDFs', 'Trích từ tài liệu của bạn'],
    'lib.pdfNote': ['These are exact sentences from your files, ranked on your computer. Nothing is made up, but do read the full quote before citing it.', 'Đây là nguyên văn các câu trong tài liệu, được xếp hạng ngay trên máy của bạn. Web không tự tạo nội dung, tuy vậy bạn nên đọc kỹ cả đoạn trước khi trích dẫn.'],
    'lib.translatedNote': ['Translated on your computer by Chrome.', 'Phần dịch được Chrome thực hiện ngay trên máy.'],
    'lib.searchedAs': ['Also searched in English: “{q}”', 'Web đã tìm thêm bằng tiếng Anh: “{q}”'],
    'lib.supporting': ['Where it comes from ({n})', 'Nguồn trích ({n})'],
    'lib.dismiss': ['Close answer', 'Đóng câu trả lời'],
    'lib.pdfAdded': ['Added {n} PDF(s) to {t}', 'Đã thêm {n} tài liệu vào {t}'],
    'lib.skipped': ['Skipped {n} file(s). Only PDFs work here.', 'Đã bỏ qua {n} tệp vì web chỉ hỗ trợ PDF.'],

    // Evidence card
    'ev.save': ['Save', 'Lưu'],
    'ev.remove': ['Unsave', 'Bỏ lưu'],
    'ev.savedBadge': ['Saved', 'Đã lưu'],
    'ev.excerpt': ['From the source', 'Nguyên văn'],
    'ev.excerptNote': ['kept in the original language', 'giữ nguyên ngôn ngữ gốc'],
    'ev.viewMap': ['Show on map', 'Xem trên sơ đồ'],
    'ev.copyRef': ['Copy reference', 'Sao chép trích dẫn'],
    'ev.savedToast': ['Saved', 'Đã lưu đoạn trích'],
    'ev.removedToast': ['Removed from saved', 'Đã bỏ lưu đoạn trích'],
    'ev.refCopied': ['Copied the {s} reference', 'Đã sao chép trích dẫn theo kiểu {s}'],

    // Reading PDFs
    'src.reading': ['Reading… {n}%', 'Đang đọc… {n}%'],
    'src.ocr': ['Reading scanned pages… {n}%', 'Đang nhận dạng trang scan… {n}%'],
    'src.noText': ['Couldn’t find any text', 'Không tìm thấy chữ trong tài liệu'],
    'src.error': ['Couldn’t open this file', 'Không thể mở tài liệu này'],
    'src.missing': ['Please add this file again', 'Bạn cần thêm lại tài liệu này'],
    'src.passages': ['{n} passages', '{n} đoạn'],
    'src.done': ['{f} is ready ({n} passages)', 'Đã đọc xong {f} ({n} đoạn)'],
    'src.doneOcr': ['{f} is ready, scanned pages included ({n} passages)', 'Đã đọc xong {f}, bao gồm cả trang scan ({n} đoạn)'],
    'src.failed': ['Couldn’t read {f}', 'Không thể đọc {f}'],
    'src.ocrLimit': ['Only the first {n} scanned pages were read.', 'Web chỉ nhận dạng {n} trang scan đầu tiên.'],
    'src.edit': ['Edit reference details', 'Sửa thông tin trích dẫn'],
    'src.addDetails': ['Add author and year', 'Thêm tác giả và năm'],
    'src.needsDetails': ['no author or year', 'thiếu tác giả và năm'],
    'src.editTitle': ['Reference details', 'Thông tin trích dẫn'],
    'src.lookup': ['Look up', 'Tra cứu'],
    'src.doiHint': ['Paste the DOI and press Look up. The details come from CrossRef.', 'Bạn dán mã DOI rồi bấm Tra cứu. Thông tin sẽ được lấy từ CrossRef.'],
    'src.type': ['Type', 'Loại tài liệu'],
    'src.tArticle': ['Journal article or conference paper', 'Bài báo khoa học hoặc bài hội thảo'],
    'src.tBook': ['Book', 'Sách'],
    'src.tReport': ['Report', 'Báo cáo'],
    'src.year': ['Year', 'Năm'],
    'src.authors': ['Authors, one per line', 'Tác giả (mỗi dòng một người)'],
    'src.authorsHint': ['Write it as “Family name, Given name”, like “Nguyen, Minh Anh”.', 'Nhập theo dạng “Họ, Tên”, ví dụ “Nguyen, Minh Anh”.'],
    'src.org': ['Or an organisation as author', 'Tổ chức tác giả (nếu không có tác giả cá nhân)'],
    'src.titleF': ['Title', 'Tiêu đề'],
    'src.journal': ['Journal or conference', 'Tạp chí hoặc hội thảo'],
    'src.volume': ['Volume', 'Tập'],
    'src.issue': ['Issue', 'Số'],
    'src.pagesF': ['Pages', 'Trang'],
    'src.publisher': ['Publisher', 'Nhà xuất bản'],
    'src.place': ['Place', 'Nơi xuất bản'],
    'src.save': ['Save', 'Lưu'],
    'src.saved': ['Saved. Citations are updated.', 'Đã lưu. Các trích dẫn đã được cập nhật.'],
    'src.lookupOk': ['Found it on CrossRef', 'Đã tìm thấy thông tin trên CrossRef'],
    'src.lookupFail': ['CrossRef doesn’t have that DOI. You can fill it in by hand.', 'CrossRef không có mã DOI này. Bạn có thể nhập thông tin thủ công.'],
    'src.doiFound': ['Found the DOI in {f} and filled in the reference', 'Web đã tìm thấy DOI trong {f} và tự điền thông tin trích dẫn'],

    // Answers
    'ans.pdfIntro': ['{n} passage(s) from {f} file(s) look relevant. The closest sentences:', 'Web tìm thấy {n} đoạn liên quan trong {f} tài liệu. Dưới đây là những câu sát nhất:'],
    'ans.noText': ['None of the PDFs in this project can be searched yet. Add one, or wait for it to finish reading.', 'Dự án này chưa có tài liệu nào tìm kiếm được. Bạn hãy thêm tài liệu hoặc chờ web đọc xong rồi hỏi lại.'],
    'ans.noPassage': ['Nothing in your PDFs matches that. Try other words, or names and terms from the readings.', 'Web không tìm thấy đoạn nào phù hợp. Bạn hãy thử từ khoá khác, hoặc dùng tên riêng và thuật ngữ có trong tài liệu.'],
    'ans.tipEn': ['Tip: your file seems to be in English, so English keywords will find more.', 'Gợi ý: tài liệu của bạn có vẻ là tiếng Anh, nên đặt câu hỏi bằng từ khoá tiếng Anh sẽ cho nhiều kết quả hơn.'],

    // Map
    'map.sub': ['Group your saved quotes into themes and show how they relate. Drag things around until it makes sense to you.', 'Sắp xếp các đoạn trích đã lưu theo chủ đề và thể hiện mối liên hệ giữa chúng. Bạn có thể kéo thả để bố trí lại.'],
    'map.emptyT': ['Save a few quotes first', 'Bạn cần lưu vài đoạn trích trước'],
    'map.emptyS': ['The map is built from the quotes you save in the Evidence Library.', 'Sơ đồ được tạo từ những đoạn trích bạn lưu trong Kho trích dẫn.'],
    'map.addTheme': ['Add theme', 'Thêm chủ đề'],
    'map.regroup': ['Suggest themes', 'Gợi ý chủ đề'],
    'map.tidy': ['Tidy up', 'Sắp xếp lại'],
    'map.theme': ['In theme', 'Thuộc chủ đề'],
    'map.meta': ['Themes {a} · Quotes {b} · Links {c}', '{a} chủ đề · {b} đoạn trích · {c} liên kết'],
    'map.pickTarget': ['Now click the quote you want to connect it to.', 'Bạn hãy bấm vào đoạn trích muốn nối tới.'],
    'map.suggested': ['suggested', 'gợi ý'],
    'map.newLink': ['New link', 'Nối hai đoạn trích'],
    'map.linkType': ['How are they related?', 'Hai đoạn này liên quan với nhau như thế nào?'],
    'map.linkNote': ['Why? (for your own notes)', 'Lý do (ghi chú của bạn)'],
    'map.linkNotePh': ['e.g. Same finding, but a different age group', 'Ví dụ: cùng kết quả nhưng nghiên cứu ở nhóm tuổi khác'],
    'map.saveLink': ['Save link', 'Lưu liên kết'],
    'map.linkSaved': ['Link saved', 'Đã lưu liên kết'],
    'map.overview': ['Overview', 'Tổng quan'],
    'map.hint': ['Click a theme or a quote to see its details. Drag to move things around.', 'Bấm vào một chủ đề hoặc đoạn trích để xem chi tiết. Bạn có thể kéo thả để di chuyển.'],
    'map.themes': ['Themes', 'Chủ đề'],
    'map.evNodes': ['Quotes', 'Đoạn trích'],
    'map.yourLinks': ['Your links', 'Liên kết'],
    'map.contras': ['Opposing', 'Trái ngược'],
    'map.howT': ['How to use it', 'Cách sử dụng'],
    'map.how1': ['Themes are suggested from the words your quotes share. Rename them to say what you mean.', 'Chủ đề được gợi ý dựa trên các từ mà các đoạn trích có chung. Bạn nên đổi tên để phù hợp với ý của mình.'],
    'map.how2': ['Dotted green lines are suggested similarities. Keep them or dismiss them.', 'Đường chấm màu xanh là gợi ý về sự tương đồng. Bạn có thể giữ hoặc bỏ.'],
    'map.how3': ['Use "Connect" on a quote to mark where sources differ or disagree. That’s usually the best part of a discussion.', 'Dùng nút "Nối với đoạn khác" để đánh dấu những chỗ các nguồn khác nhau hoặc trái ngược. Đây thường là chất liệu tốt cho phần bàn luận.'],
    'map.tensions': ['Where sources disagree', 'Những chỗ các nguồn trái ngược'],
    'map.kindTheme': ['Theme', 'Chủ đề'],
    'map.kindEv': ['Quote', 'Đoạn trích'],
    'map.themeName': ['Name', 'Tên chủ đề'],
    'map.inTheme': ['Quotes in this theme ({n})', 'Các đoạn trích trong chủ đề ({n})'],
    'map.themeEmpty': ['Nothing here yet. Open a quote and pick this theme.', 'Chủ đề này chưa có đoạn trích nào. Bạn hãy mở một đoạn trích và chọn chủ đề này.'],
    'map.openLib': ['See in library', 'Xem trong Kho trích dẫn'],
    'map.deleteTheme': ['Delete theme', 'Xoá chủ đề'],
    'map.deleteThemeConfirm': ['Delete the theme “{t}”? Its quotes stay, they just won’t have a theme.', 'Bạn có chắc muốn xoá chủ đề “{t}”? Các đoạn trích vẫn được giữ lại nhưng sẽ không thuộc chủ đề nào.'],
    'map.unsorted': ['No theme', 'Chưa có chủ đề'],
    'map.connect': ['Connect to another quote', 'Nối với đoạn khác'],
    'map.conns': ['Links ({n})', 'Liên kết ({n})'],
    'map.noConns': ['Not linked to anything yet.', 'Đoạn trích này chưa có liên kết nào.'],
    'map.deleteLink': ['Delete link', 'Xoá liên kết'],
    'map.sharedTerms': ['Both mention: {w}', 'Cùng đề cập: {w}'],
    'map.keep': ['Keep', 'Giữ'],
    'map.dismiss': ['Dismiss', 'Bỏ'],
    'map.closeDetail': ['Close', 'Đóng'],
    'map.other': ['Other', 'Khác'],
    'map.themeN': ['Theme {n}', 'Chủ đề {n}'],
    'map.needTwo': ['Save at least two quotes first.', 'Bạn cần lưu ít nhất hai đoạn trích trước.'],
    'map.regroupConfirm': ['Suggest themes again? Your current themes and positions will be replaced. Your links stay.', 'Bạn có muốn gợi ý lại chủ đề? Chủ đề và vị trí hiện tại sẽ được thay mới, còn các liên kết vẫn được giữ.'],
    'map.grouped': ['Suggested {n} themes. Rename them however you like.', 'Web đã gợi ý {n} chủ đề. Bạn có thể đổi tên cho phù hợp.'],

    // Builder
    'b.sub': ['Turn your quotes into an outline. Drag sections to reorder, and drag saved quotes onto a section to back it up.', 'Biến các đoạn trích thành dàn ý. Bạn kéo các ý để đổi thứ tự, và kéo đoạn trích đã lưu vào một ý để làm dẫn chứng cho ý đó.'],
    'b.copy': ['Copy outline', 'Sao chép dàn ý'],
    'b.refs': ['References', 'Tài liệu tham khảo'],
    'b.add': ['Add section', 'Thêm ý'],
    'b.addLong': ['Add a section', 'Thêm một ý'],
    'b.thesis': ['Main argument', 'Luận điểm chính'],
    'b.thesisPh': ['What’s the one thing your essay is arguing?', 'Bài viết của bạn muốn chứng minh điều gì?'],
    'b.thesisEmpty': ['Write your main argument here. Your question was: “{q}”', 'Bạn hãy viết luận điểm chính tại đây. Câu hỏi nghiên cứu của bạn là: “{q}”'],
    'b.saveThesis': ['Save', 'Lưu'],
    'b.thesisSaved': ['Saved', 'Đã lưu luận điểm'],
    'b.noSections': ['No sections yet', 'Dàn ý chưa có ý nào'],
    'b.noSectionsSub': ['Add your supporting points, a counterargument and your reply to it, then back each one with quotes.', 'Bạn hãy thêm các ý hỗ trợ, một ý phản biện và phần phản hồi, sau đó gắn đoạn trích làm dẫn chứng cho từng ý.'],
    'b.saved': ['Saved quotes', 'Đoạn trích đã lưu'],
    'b.check': ['Quick check', 'Kiểm tra nhanh'],
    'b.ckThesis': ['Main argument written', 'Đã có luận điểm chính'],
    'b.ckThesisW': ['Write your main argument', 'Chưa có luận điểm chính'],
    'b.ckSections': ['{n} sections', '{n} ý'],
    'b.ckNoEv': ['{n} section(s) with no quotes', '{n} ý chưa có dẫn chứng'],
    'b.ckAllEv': ['Every section has a quote', 'Mọi ý đều có dẫn chứng'],
    'b.ckCounter': ['Counterargument included', 'Đã có ý phản biện'],
    'b.ckCounterW': ['No counterargument yet', 'Chưa có ý phản biện'],
    'b.dragHint': ['Drag onto a section', 'Kéo vào một ý'],
    'b.used': ['used {n}×', 'đã dùng {n} lần'],
    'b.trayEmpty': ['Save some quotes in the library and they’ll show up here.', 'Các đoạn trích bạn lưu trong Kho trích dẫn sẽ xuất hiện ở đây.'],
    'b.goLib': ['Go to the library', 'Mở Kho trích dẫn'],
    'b.section': ['Section {n}', 'Ý {n}'],
    'b.editing': ['Section {n}, editing', 'Ý {n} (đang sửa)'],
    'b.moveUp': ['Move up', 'Chuyển lên'],
    'b.moveDown': ['Move down', 'Chuyển xuống'],
    'b.editSec': ['Edit', 'Sửa'],
    'b.delSec': ['Delete', 'Xoá'],
    'b.linked': ['Quotes ({n})', 'Dẫn chứng ({n})'],
    'b.notSaved': ['no longer saved', 'đã bỏ lưu'],
    'b.noEv': ['No quotes yet. A point without evidence is just an opinion.', 'Ý này chưa có dẫn chứng. Một ý không có dẫn chứng chỉ là ý kiến cá nhân.'],
    'b.linkSel': ['+ Add a saved quote…', '+ Thêm đoạn trích đã lưu…'],
    'b.orDrag': ['or drag one in from the side', 'hoặc kéo từ cột bên cạnh'],
    'b.unlink': ['Remove quote', 'Gỡ đoạn trích'],
    'b.type': ['Kind of section', 'Loại ý'],
    'b.claim': ['Point', 'Nội dung ý'],
    'b.claimPh': ['What does this section argue?', 'Ý này lập luận điều gì?'],
    'b.reason': ['Explanation', 'Giải thích'],
    'b.reasonPh': ['How do your quotes support it?', 'Các đoạn trích chứng minh cho ý này như thế nào?'],
    'b.saveSec': ['Save', 'Lưu'],
    'b.added': ['Section added', 'Đã thêm ý'],
    'b.updated': ['Section saved', 'Đã lưu ý'],
    'b.deleted': ['Section deleted', 'Đã xoá ý'],
    'b.confirmDel': ['Delete “{t}”?', 'Bạn có chắc muốn xoá ý “{t}”?'],
    'b.untitled': ['Untitled', 'Chưa đặt tên'],
    'b.linkedToast': ['Quote added', 'Đã gắn đoạn trích'],
    'b.already': ['That quote is already in this section', 'Đoạn trích này đã có trong ý'],
    'b.reordered': ['Order saved', 'Đã lưu thứ tự mới'],
    'b.copied': ['Outline copied, with {s} references', 'Đã sao chép dàn ý kèm trích dẫn theo kiểu {s}'],
    'b.copyFail': ['Couldn’t copy', 'Không thể sao chép'],
    'b.exportQ': ['Research question', 'Câu hỏi nghiên cứu'],
    'b.exportThesis': ['MAIN ARGUMENT', 'LUẬN ĐIỂM CHÍNH'],
    'b.exportRefs': ['REFERENCES', 'TÀI LIỆU THAM KHẢO'],

    // Section and link types
    'type.supporting': ['Supporting point', 'Ý hỗ trợ'],
    'type.counter': ['Counterargument', 'Phản biện'],
    'type.rebuttal': ['Response', 'Phản hồi'],
    'conn.similar': ['Similar', 'Tương đồng'],
    'conn.different': ['Different', 'Khác biệt'],
    'conn.contradicts': ['Opposing', 'Trái ngược'],

    // References
    'ref.title': ['Reference list', 'Danh mục tham khảo'],
    'ref.sub': ['{p}, in {s}', '{p}, theo kiểu {s}'],
    'ref.style': ['Style', 'Kiểu trích dẫn'],
    'ref.inText': ['In-text', 'Trích dẫn trong bài'],
    'ref.copyAll': ['Copy list', 'Sao chép danh mục'],
    'ref.copied': ['Reference list copied', 'Đã sao chép danh mục tham khảo'],
    'ref.incomplete': ['Missing the author or year.', 'Tài liệu này thiếu tác giả hoặc năm.'],
    'ref.disclaimer': ['Formatted the way RMIT Library describes each style. It’s still worth checking against <a href="https://www.lib.rmit.edu.au/easy-cite/" target="_blank" rel="noopener">RMIT Easy Cite</a> before you submit.', 'Trích dẫn được định dạng theo hướng dẫn của Thư viện RMIT. Trước khi nộp bài, bạn vẫn nên đối chiếu lại với <a href="https://www.lib.rmit.edu.au/easy-cite/" target="_blank" rel="noopener">RMIT Easy Cite</a>.'],
    'ref.empty': ['No PDFs yet, so no references either.', 'Dự án chưa có tài liệu PDF nên chưa có tài liệu tham khảo.'],
    'ref.harvardNote': ['', ''],
    'ref.apaNote': ['', ''],
    'ref.ieeeNote': ['', ''],
    'ref.chicagoNote': ['', ''],
    'ref.vancouverNote': ['', ''],
    'ref.aglcNote': ['', ''],

    // Settings
    'set.sub': ['Your name, language and reference style.', 'Thông tin cá nhân, ngôn ngữ và kiểu trích dẫn.'],
    'set.profile': ['Profile', 'Hồ sơ'],
    'set.name': ['Name', 'Họ và tên'],
    'set.uni': ['University or campus', 'Trường hoặc cơ sở'],
    'set.program': ['Program', 'Ngành học'],
    'set.prefs': ['Preferences', 'Tuỳ chỉnh'],
    'set.lang': ['Language', 'Ngôn ngữ'],
    'set.langNote': ['Quotes always stay in the language of the original file.', 'Đoạn trích luôn giữ nguyên ngôn ngữ của tài liệu gốc.'],
    'set.cite': ['Reference style', 'Kiểu trích dẫn'],
    'set.save': ['Save', 'Lưu'],
    'set.saved': ['Saved', 'Đã lưu cài đặt'],
    'set.help': ['Help', 'Trợ giúp'],
    'set.helpSub': ['Forgot how something works?', 'Bạn có thể xem lại hướng dẫn bất cứ lúc nào.'],
    'set.replay': ['Show the walkthrough again', 'Xem lại hướng dẫn'],
    'set.viewIntro': ['Intro page', 'Trang giới thiệu'],
    'set.data': ['Your data', 'Dữ liệu'],
    'set.dataSub': ['Everything is stored in this browser only. Deleting it can’t be undone.', 'Toàn bộ dữ liệu chỉ được lưu trong trình duyệt này. Dữ liệu đã xoá sẽ không thể khôi phục.'],
    'set.reset': ['Delete everything', 'Xoá toàn bộ dữ liệu'],
    'set.resetConfirm': ['Delete all projects, PDFs, quotes, maps and outlines? This can’t be undone.', 'Bạn có chắc muốn xoá toàn bộ dự án, tài liệu, đoạn trích, sơ đồ và dàn ý? Thao tác này không thể hoàn tác.'],
    'set.resetDone': ['All data deleted', 'Đã xoá toàn bộ dữ liệu'],
    'set.about': ['About', 'Về Trace & Think'],
    'set.about1': ['PDFs are read in your browser with PDF.js (and Tesseract for scanned pages), searched with MiniSearch, and grouped into themes with a bit of text analysis. Nothing is sent to a server, apart from DOI lookups to CrossRef.', 'Tài liệu PDF được đọc ngay trên trình duyệt bằng PDF.js (trang scan được nhận dạng bằng Tesseract), tìm kiếm bằng MiniSearch và phân nhóm chủ đề bằng phương pháp phân tích văn bản. Ngoài việc tra cứu DOI trên CrossRef, web không gửi dữ liệu đến máy chủ nào.'],
    'set.about2': ['A student project for RMIT. Not affiliated with RMIT University.', 'Đây là dự án của sinh viên trong khuôn khổ môn học tại RMIT, không phải sản phẩm chính thức của trường.'],

    // New project modal
    'modal.title': ['New project', 'Tạo dự án'],
    'modal.sub': ['One project per assignment works best.', 'Mỗi bài tập nên có một dự án riêng.'],
    'modal.ptitle': ['Project name', 'Tên dự án'],
    'modal.ptitlePh': ['e.g. Wayang kulit and Indonesian visual culture', 'Ví dụ: Wayang kulit và văn hoá thị giác Indonesia'],
    'modal.titleError': ['Give it a name first.', 'Bạn cần đặt tên cho dự án.'],
    'modal.question': ['Research question', 'Câu hỏi nghiên cứu'],
    'modal.questionPh': ['What are you trying to find out?', 'Bạn muốn tìm hiểu điều gì?'],
    'modal.questionHint': ['The more specific, the easier it is to find good quotes.', 'Câu hỏi càng cụ thể thì càng dễ tìm được đoạn trích phù hợp.'],
    'modal.course': ['Course code', 'Mã môn học'],
    'modal.due': ['Due date', 'Hạn nộp'],
    'modal.desc': ['Notes', 'Ghi chú'],
    'modal.descPh': ['Anything you want to remember about this assignment', 'Những điều bạn cần lưu ý về bài tập này'],
    'modal.sources': ['PDFs', 'Tài liệu PDF'],
    'modal.drop': ['Drop PDFs here or browse', 'Kéo tài liệu PDF vào đây hoặc chọn từ máy'],
    'modal.dropHint': ['Read on your computer, never uploaded anywhere', 'Tài liệu được đọc ngay trên máy và không được tải lên mạng'],
    'modal.create': ['Create', 'Tạo dự án'],
    'modal.created': ['Created “{t}”', 'Đã tạo dự án “{t}”'],
    'modal.remove': ['Remove {t}', 'Bỏ {t}'],

    // Activity
    'act.asked': ['Asked “{q}”', 'Đã hỏi “{q}”'],
    'act.saved': ['Saved “{t}”', 'Đã lưu “{t}”'],
    'act.removed': ['Unsaved “{t}”', 'Đã bỏ lưu “{t}”'],
    'act.uploaded': ['Added {f}', 'Đã thêm {f}'],
    'act.uploadedN': ['Added {n} PDFs', 'Đã thêm {n} tài liệu'],
    'act.created': ['Created “{t}”', 'Đã tạo dự án “{t}”'],
    'act.addedSec': ['Added the section “{t}”', 'Đã thêm ý “{t}”'],
    'act.editedSec': ['Edited “{t}”', 'Đã sửa ý “{t}”'],
    'act.deletedSec': ['Deleted “{t}”', 'Đã xoá ý “{t}”'],
    'act.linked': ['Added a quote to “{a}”', 'Đã gắn đoạn trích vào ý “{a}”'],
    'act.thesis': ['Updated the main argument', 'Đã cập nhật luận điểm chính'],
    'act.grouped': ['Grouped quotes into {n} themes', 'Đã phân các đoạn trích thành {n} chủ đề'],
    'act.mapLink': ['Linked two quotes ({t})', 'Đã nối hai đoạn trích ({t})'],

    // Tour
    'tour.next': ['Next', 'Tiếp theo'],
    'tour.back': ['Back', 'Quay lại'],
    'tour.skip': ['Skip', 'Bỏ qua'],
    'tour.finish': ['Got it', 'Đã hiểu'],
    'tour.start': ['Show me', 'Bắt đầu'],
    'tour.count': ['{i} of {n}', '{i}/{n}'],
    'tour.done': ['That’s it. You can see this again with the ? button.', 'Bạn đã xem xong hướng dẫn. Bạn có thể xem lại bằng nút ? ở góc trên.'],
    'tour.0.t': ['Hi, welcome to Trace & Think', 'Chào mừng bạn đến với Trace & Think'],
    'tour.0.b': ['Want a quick look around? It takes about a minute. You can also skip it and figure things out yourself.', 'Phần hướng dẫn nhanh này mất khoảng một phút. Bạn cũng có thể bỏ qua và tự khám phá.'],
    'tour.1.t': ['The steps, in order', 'Các bước theo thứ tự'],
    'tour.1.b': ['The menu follows how you’d normally research: collect quotes, sort out the ideas, then write the outline.', 'Menu được sắp xếp theo đúng trình tự nghiên cứu: thu thập đoạn trích, sắp xếp ý tưởng, sau đó viết dàn ý.'],
    'tour.2.t': ['Start with a project', 'Bắt đầu bằng một dự án'],
    'tour.2.b': ['Make one per assignment. Add your research question and the PDFs you’re reading.', 'Mỗi bài tập nên có một dự án. Bạn nhập câu hỏi nghiên cứu và thêm các tài liệu PDF đang đọc.'],
    'tour.3.t': ['Where you’re up to', 'Tiến độ của bạn'],
    'tour.3.b': ['These four steps show how far along the project is. Click one to jump there.', 'Bốn bước này cho biết dự án đang ở giai đoạn nào. Bạn bấm vào một bước để chuyển đến bước đó.'],
    'tour.4.t': ['Ask your PDFs', 'Đặt câu hỏi cho tài liệu'],
    'tour.4.b': ['Type a question and you’ll get the sentences from your files that answer it, with page numbers. English keywords work best for English readings.', 'Khi bạn đặt câu hỏi, web sẽ trích những câu trong tài liệu trả lời được câu hỏi đó, kèm số trang. Với tài liệu tiếng Anh, từ khoá tiếng Anh cho kết quả tốt hơn.'],
    'tour.5.t': ['Every quote shows where it’s from', 'Mỗi đoạn trích đều ghi rõ nguồn'],
    'tour.5.b': ['You see the exact wording, the file, the page and a ready-made in-text citation. Save the ones you want to use.', 'Mỗi đoạn hiển thị nguyên văn, tên tài liệu, số trang và trích dẫn trong bài. Bạn bấm Lưu với những đoạn muốn sử dụng.'],
    'tour.6.t': ['Sort out your ideas', 'Sắp xếp ý tưởng'],
    'tour.6.b': ['Saved quotes get grouped into themes. Rename them, drag them around, and mark where sources agree or disagree.', 'Các đoạn trích đã lưu được phân theo chủ đề. Bạn có thể đổi tên chủ đề, kéo thả và đánh dấu những chỗ các nguồn tương đồng hoặc trái ngược.'],
    'tour.7.t': ['Build the outline', 'Viết dàn ý'],
    'tour.7.b': ['Write your main argument, add sections and drag quotes onto them. When you’re ready, copy the whole thing with references.', 'Bạn viết luận điểm chính, thêm các ý và kéo đoạn trích vào từng ý. Khi hoàn tất, bạn có thể sao chép toàn bộ dàn ý kèm tài liệu tham khảo.'],
    'tour.8.t': ['Language and references', 'Ngôn ngữ và trích dẫn'],
    'tour.8.b': ['Switch between English and Vietnamese here. Pick RMIT Harvard, APA or another style in Settings.', 'Bạn có thể chuyển giữa tiếng Anh và tiếng Việt tại đây. Kiểu trích dẫn như RMIT Harvard hay APA được chọn trong phần Cài đặt.'],

    // Landing
    'l.features': ['Features', 'Tính năng'],
    'l.how': ['How it works', 'Cách sử dụng'],
    'l.rmit': ['For RMIT students', 'Dành cho sinh viên RMIT'],
    'l.open': ['Open the app', 'Mở ứng dụng'],
    'l.eyebrow': ['A research workspace for RMIT students', 'Không gian nghiên cứu dành cho sinh viên RMIT'],
    'l.h1a': ['Research with clarity.', 'Nghiên cứu rõ ràng.'],
    'l.h1b': ['Think with evidence.', 'Lập luận có dẫn chứng.'],
    'l.lead': ['Drop in the PDFs for your assignment, ask them questions, keep the quotes that matter and turn them into an outline. Every quote stays linked to its file and page, so citing is the easy part.', 'Bạn thêm tài liệu PDF của bài tập, đặt câu hỏi, lưu lại những đoạn quan trọng và biến chúng thành dàn ý. Mỗi đoạn trích đều gắn với tên tài liệu và số trang, giúp việc trích dẫn trở nên đơn giản hơn.'],
    'l.cta': ['Get started', 'Bắt đầu'],
    'l.cta2': ['How it works', 'Xem cách sử dụng'],
    'l.ctaNote': ['Free, no sign-up. Your files stay on your computer.', 'Miễn phí và không cần đăng ký. Tài liệu của bạn chỉ nằm trên máy của bạn.'],
    'l.probT': ['Every semester, the same research struggle', 'Học kỳ nào cũng gặp cùng một khó khăn khi nghiên cứu'],
    'l.probS': ['Every semester brings research and far too much to read. Finding sources, reading, remembering and turning notes into an argument are all hard.', 'Mỗi học kỳ, sinh viên đều phải làm nghiên cứu với khối lượng tài liệu rất lớn. Từ tìm tài liệu, đọc, ghi nhớ cho đến biến ghi chú thành lập luận, bước nào cũng tốn nhiều công sức.'],
    'l.p1t': ['100 tabs, nowhere to take notes', 'Mở hàng trăm tab nhưng không có chỗ ghi chú'],
    'l.p1b': ['PDFs are open everywhere, with no single place to keep the parts that matter.', 'Tài liệu PDF mở khắp nơi nhưng không có một chỗ chung để lưu lại những đoạn quan trọng.'],
    'l.p2t': ['“Which file was that quote in?”', 'Không nhớ câu trích nằm ở tài liệu nào'],
    'l.p2b': ['It’s hard to remember which file and page a quote came from, and finding it again takes ages.', 'Rất khó nhớ một câu nằm ở tài liệu nào, trang mấy, và việc tìm lại mất nhiều thời gian.'],
    'l.p3t': ['AI summaries make things up', 'Công cụ AI tóm tắt sai nguồn'],
    'l.p3b': ['Tools like ChatGPT often get sources wrong and even make up references that don’t exist.', 'Khi dùng ChatGPT để tóm tắt, nguồn thường bị ghi sai, thậm chí có những tài liệu tham khảo không hề tồn tại.'],
    'l.howT': ['Four steps, same every time', 'Bốn bước rõ ràng cho mỗi bài tập'],
    'l.howS': ['The app walks you through them in order.', 'Web hướng dẫn bạn thực hiện lần lượt từng bước.'],
    'l.h1t': ['Make a project and add PDFs', 'Tạo dự án và thêm tài liệu'],
    'l.h1d': ['Write your research question and drop in your readings. Scanned PDFs work too.', 'Bạn nhập câu hỏi nghiên cứu và thêm các tài liệu cần đọc. Web đọc được cả tài liệu scan.'],
    'l.h2t': ['Ask and save quotes', 'Đặt câu hỏi và lưu đoạn trích'],
    'l.h2d': ['Ask a question and get the sentences that answer it, with page numbers.', 'Web trả về những câu trong tài liệu trả lời được câu hỏi, kèm số trang.'],
    'l.h3t': ['Sort out the ideas', 'Sắp xếp ý tưởng'],
    'l.h3d': ['Group quotes into themes and mark where sources agree or disagree.', 'Bạn phân đoạn trích theo chủ đề và đánh dấu những chỗ các nguồn tương đồng hoặc trái ngược.'],
    'l.h4t': ['Write the outline', 'Viết dàn ý'],
    'l.h4d': ['Put your points in order, back each one with quotes, and copy it out with references.', 'Bạn sắp xếp các ý, gắn dẫn chứng cho từng ý và sao chép dàn ý kèm tài liệu tham khảo.'],
    'l.featT': ['What you can do with it', 'Những gì bạn có thể làm'],
    'l.f1t': ['Real answers from your files', 'Câu trả lời từ chính tài liệu'],
    'l.f1d': ['Answers are the actual sentences from your PDFs. Nothing is made up.', 'Câu trả lời là nguyên văn trong tài liệu PDF của bạn. Web không tự tạo nội dung.'],
    'l.f2t': ['Reads scanned pages', 'Đọc được trang scan'],
    'l.f2d': ['Pages that are just images are read with OCR, in English or Vietnamese.', 'Những trang chỉ là hình ảnh được nhận dạng bằng OCR, hỗ trợ cả tiếng Anh và tiếng Việt.'],
    'l.f3t': ['Insight Map', 'Sơ đồ ý tưởng'],
    'l.f3d': ['See your quotes grouped by theme and how they connect.', 'Bạn thấy các đoạn trích được phân theo chủ đề và mối liên hệ giữa chúng.'],
    'l.f4t': ['Argument Builder', 'Dàn ý'],
    'l.f4d': ['A drag and drop outline: main argument, points, counterargument and response.', 'Dàn ý dạng kéo thả gồm luận điểm chính, các ý hỗ trợ, phản biện và phản hồi.'],
    'l.f5t': ['RMIT reference styles', 'Trích dẫn theo chuẩn RMIT'],
    'l.f5d': ['RMIT Harvard, APA 7th, IEEE, Chicago, Vancouver and AGLC4. DOIs are looked up for you.', 'Hỗ trợ RMIT Harvard, APA 7th, IEEE, Chicago, Vancouver và AGLC4. Nếu tài liệu có DOI, web sẽ tự tra cứu thông tin.'],
    'l.f6t': ['English or Vietnamese', 'Tiếng Anh và tiếng Việt'],
    'l.f6d': ['Use the app in either language. Quotes stay in the original.', 'Bạn có thể dùng web bằng cả hai ngôn ngữ. Đoạn trích luôn giữ nguyên ngôn ngữ gốc.'],
    'l.rmitT': ['Made with RMIT assignments in mind', 'Thiết kế cho bài tập tại RMIT'],
    'l.rmitS': ['Saigon South, Hanoi or Melbourne, the referencing rules are the same. So is the struggle.', 'Dù bạn học ở Nam Sài Gòn, Hà Nội hay Melbourne, quy tắc trích dẫn đều giống nhau, và khó khăn khi làm nghiên cứu cũng vậy.'],
    'l.r1': ['RMIT Harvard by default, plus the other Easy Cite styles', 'Mặc định là RMIT Harvard, kèm các kiểu khác trong Easy Cite'],
    'l.r2': ['In-text citations with page numbers, ready to paste', 'Trích dẫn trong bài có sẵn số trang, có thể dán trực tiếp'],
    'l.r3': ['Good for essays, literature reviews and capstone projects', 'Phù hợp cho essay, literature review và capstone project'],
    'l.r4': ['English and Vietnamese, for RMIT Vietnam', 'Hỗ trợ tiếng Việt cho sinh viên RMIT Việt Nam'],
    'l.sampleRef': ['One source, three styles', 'Một tài liệu, ba kiểu trích dẫn'],
    'l.finalT': ['Got an assignment due?', 'Bạn sắp đến hạn nộp bài?'],
    'l.finalS': ['Make a project, add your PDFs and ask your first question.', 'Hãy tạo dự án, thêm tài liệu PDF và đặt câu hỏi đầu tiên.'],
    'l.footer': ['A student project, not affiliated with RMIT University. The example above is made up.', 'Đây là dự án của sinh viên, không phải sản phẩm của Đại học RMIT. Ví dụ ở trên chỉ mang tính minh hoạ.'],
    'l.mockQ': ['Does phone use at night affect sleep?', 'Dùng điện thoại vào ban đêm có ảnh hưởng đến giấc ngủ không?'],
    'l.mockTheme': ['Sleep', 'Giấc ngủ'],
    'l.mockTitle': ['Phone use after lights-out shortens sleep', 'Dùng điện thoại sau khi tắt đèn làm giảm thời gian ngủ'],
    'l.mockNote': ['Example only', 'Ví dụ minh hoạ'],

    // Page guides (one short caption per picture)
    'g.button': ['How to use', 'Cách sử dụng'],
    'g.gotIt': ['Got it', 'Đã hiểu'],
    'g.hidden': ['Hidden. Tap “How to use” to see it again.', 'Đã ẩn hướng dẫn. Bạn bấm “Cách sử dụng” để xem lại.'],
    'g.dashboard.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.dashboard.1': ['One project per assignment', 'Mỗi bài tập một dự án'],
    'g.dashboard.2': ['Follow the 4 steps', 'Làm theo bốn bước'],
    'g.dashboard.3': ['Switch projects up here', 'Đổi dự án ở thanh trên cùng'],
    'g.projects.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.projects.1': ['Click to open', 'Bấm để mở dự án'],
    'g.projects.2': ['Search by name or course', 'Tìm theo tên hoặc mã môn'],
    'g.projects.3': ['Bin to delete', 'Bấm thùng rác để xoá'],
    'g.evidence.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.evidence.1': ['Add your PDFs', 'Thêm tài liệu PDF'],
    'g.evidence.2': ['Ask or type keywords', 'Đặt câu hỏi hoặc nhập từ khoá'],
    'g.evidence.3': ['Save what you need', 'Lưu đoạn trích cần dùng'],
    'g.evidence.4': ['Orange icon: add author, year', 'Biểu tượng cam: thêm tác giả và năm'],
    'g.map.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.map.1': ['Save 2+ quotes first', 'Lưu ít nhất hai đoạn trích'],
    'g.map.2': ['Click a theme to rename', 'Bấm vào chủ đề để đổi tên'],
    'g.map.3': ['Click a quote, Connect, click another', 'Chọn đoạn, bấm Nối, chọn đoạn còn lại'],
    'g.map.4': ['Pick how they relate', 'Chọn loại liên kết'],
    'g.map.5': ['Drag cards anywhere', 'Kéo thả thẻ để sắp xếp'],
    'g.map.6': ['Dotted line: ✓ keep, ✕ hide', 'Đường chấm: ✓ giữ, ✕ bỏ'],
    'g.builder.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.builder.1': ['Write your main argument', 'Viết luận điểm chính'],
    'g.builder.2': ['Add a section per point', 'Thêm từng ý'],
    'g.builder.3': ['Drag quotes into a section', 'Kéo đoạn trích vào ý'],
    'g.builder.4': ['Copy it with references', 'Sao chép kèm trích dẫn'],
    'g.settings.t': ['Quick guide', 'Hướng dẫn nhanh'],
    'g.settings.1': ['Pick a reference style', 'Chọn kiểu trích dẫn'],
    'g.settings.2': ['Switch language', 'Đổi ngôn ngữ'],
    'g.settings.3': ['Wipe all data', 'Xoá toàn bộ dữ liệu']
  };

  /* ------------------------------------------------------
     2. EXAMPLE DATA
     Only used to illustrate the landing page and the citation preview in Settings.
     The source below is made up for the illustration; students only ever see their own PDFs in the app.
     ------------------------------------------------------ */
  const EXAMPLE_SOURCE = {
    id: 'example', file: 'Hartley_Chen_2022_Screen_Time.pdf', type: 'article', year: 2022,
    authors: [{ family: 'Hartley', given: 'James' }, { family: 'Chen', given: 'Lin' }],
    title: 'Screen time and adolescent wellbeing: a three-wave cohort study', journal: 'Journal of Adolescent Health Research',
    jAbbr: 'J Adolesc Health Res', volume: 14, issue: 2, range: '112–135'
  };
  const EXAMPLE_EXCERPT = 'Participants who used a smartphone after lights-out on four or more nights per week slept on average 41 minutes less on school nights and reported significantly poorer subjective sleep quality.';
  const CONN_ICONS = { similar: 'equal', different: 'git-compare', contradicts: 'zap' };

  /* ------------------------------------------------------
     3. REFERENCING
     ------------------------------------------------------ */
  const CITATION_STYLES = {
    'rmit-harvard': { label: 'RMIT Harvard', note: 'ref.harvardNote' },
    'apa7': { label: 'APA 7th', note: 'ref.apaNote' },
    'ieee': { label: 'IEEE', note: 'ref.ieeeNote' },
    'chicago': { label: 'Chicago B', note: 'ref.chicagoNote' },
    'vancouver': { label: 'Vancouver', note: 'ref.vancouverNote' },
    'aglc4': { label: 'AGLC4', note: 'ref.aglcNote' }
  };
  const NUMERIC_STYLES = ['ieee', 'vancouver'];

  const initials = (given, dots) => (given || '').split(/[\s-]+/).filter(Boolean).map(p => p[0].toUpperCase() + (dots ? '.' : '')).join(dots ? ' ' : '');
  function joinNames(list, sep, last) {
    if (list.length <= 1) return list.join('');
    return list.slice(0, -1).join(sep) + last + list[list.length - 1];
  }
  function hasMeta(src) { return !!(src.org || (src.authors && src.authors.length)); }
  /* A source is "complete" when it has a creator and a year, otherwise the student is prompted to add details */
  const isComplete = (src) => hasMeta(src) && !!src.year;
  const shortTitle = (title) => {
    const words = (title || '').split(/\s+/);
    return words.length > 6 ? words.slice(0, 6).join(' ') + '…' : title;
  };

  /* Author part of an in-text citation. With no author, author-date styles use the (short) title instead. */
  function citeWho(src, style, html) {
    if (src.org) return html ? esc(src.org) : src.org;
    const a = src.authors || [];
    if (!a.length) {
      const st = shortTitle(src.title);
      return html ? `<i>${esc(st)}</i>` : st;
    }
    const and = style === 'apa7' ? '&' : 'and';
    let who;
    if (a.length === 1) who = a[0].family;
    else if (a.length === 2) who = `${a[0].family} ${and} ${a[1].family}`;
    else who = `${a[0].family} et al.`;
    return html ? esc(who) : who;
  }

  /** In-text citation, e.g. RMIT Harvard → (Hartley and Chen 2022:9). Pass html=true to get italics for titles. */
  function inText(src, page, style = state.user.citation, n = 1, html = false) {
    const year = src.year || 'n.d.';
    const who = citeWho(src, style, html);
    switch (style) {
      case 'apa7': return `(${who}, ${year}${page ? `, p. ${page}` : ''})`;
      case 'chicago': return `(${who} ${year}${page ? `, ${page}` : ''})`;
      case 'ieee': return `[${n}${page ? `, p. ${page}` : ''}]`;
      case 'vancouver': return `(${n}${page ? `, p. ${page}` : ''})`;
      case 'aglc4': return `${String(who).replace(' et al.', ' et al')} (n ${n})${page ? ` ${page}` : ''}`; // subsequent footnote form
      default: return `(${who} ${year}${page ? `:${page}` : ''})`;
    }
  }

  /** Full reference entry (HTML with <i> for italics). Missing fields are simply left out. */
  function reference(src, style = state.user.citation, n = 1) {
    const y = src.year || 'n.d.';
    const T = esc(src.title);
    const type = src.type || (src.journal ? 'article' : 'book');
    const doi = src.doi ? String(src.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '') : '';
    const J = esc(src.journal || ''), v = src.volume, iss = src.issue, r = src.range || '';
    const pub = esc(src.publisher || ''), pl = esc(src.place || '');
    const a = src.authors || [];
    const creator = (fmt) => (src.org ? esc(src.org) : a.length ? fmt() : '');

    // Names per style
    const names = {
      'rmit-harvard': () => esc(joinNames(a.map(x => `${x.family}${x.given ? ' ' + initials(x.given, false) : ''}`), ', ', ' and ')),
      apa7: () => esc(joinNames(a.map(x => `${x.family}${x.given ? ', ' + initials(x.given, true) : ''}`), ', ', a.length > 1 ? ', & ' : '')),
      ieee: () => esc(joinNames(a.map(x => `${x.given ? initials(x.given, true) + ' ' : ''}${x.family}`), ', ', a.length > 2 ? ', and ' : ' and ')),
      chicago: () => esc(joinNames(a.map((x, i) => (i === 0 ? `${x.family}${x.given ? ', ' + x.given : ''}` : `${x.given ? x.given + ' ' : ''}${x.family}`)), ', ', ', and ')),
      vancouver: () => esc(a.map(x => `${x.family}${x.given ? ' ' + initials(x.given, false) : ''}`).join(', ')),
      aglc4: () => esc(a.length > 3 ? `${a[0].given} ${a[0].family} et al` : joinNames(a.map(x => `${x.given ? x.given + ' ' : ''}${x.family}`), ', ', ' and '))
    };
    const who = creator(names[style] || names['rmit-harvard']);
    // volume(issue) helpers
    const vi = (sepIssue = '') => (v ? `${v}${iss ? `${sepIssue}(${iss})` : ''}` : iss ? `(${iss})` : '');

    if (type === 'article') {
      switch (style) {
        case 'apa7': return `${who ? who + ' ' : ''}(${y}). ${T}. <i>${J}</i>${v ? `, <i>${v}</i>${iss ? `(${iss})` : ''}` : ''}${r ? `, ${r}` : ''}.${doi ? ` https://doi.org/${esc(doi)}` : ''}`;
        case 'ieee': return `[${n}] ${who ? who + ', ' : ''}“${T},” <i>${J}</i>${v ? `, vol. ${v}` : ''}${iss ? `, no. ${iss}` : ''}${r ? `, pp. ${r}` : ''}, ${y}${doi ? `, doi: ${esc(doi)}` : ''}.`;
        case 'chicago': return `${who ? who + '. ' : ''}${y}. “${T}.” <i>${J}</i>${v ? ` ${v}` : ''}${iss ? ` (${iss})` : ''}${r ? `: ${r}` : ''}.${doi ? ` https://doi.org/${esc(doi)}.` : ''}`;
        case 'vancouver': return `${n}. ${who ? who + '. ' : ''}${T}. ${esc(src.jAbbr || src.journal || '')}. ${y}${vi() ? `;${vi()}` : ''}${r ? `:${r.replace('–', '-')}` : ''}.${doi ? ` doi:${esc(doi)}` : ''}`;
        case 'aglc4': return `${who ? who + ', ' : ''}‘${T}’ (${y})${vi() ? ' ' + vi() : ''} <i>${J}</i>${r ? ' ' + r.split(/[–-]/)[0] : ''}`;
        default: return `${who || `<i>${T}</i>`} (${y})${who ? ` ‘${T}’,` : ''} <i>${J}</i>${vi() ? `, ${vi()}` : ''}${r ? `:${r}` : ''}${doi ? `, doi:${esc(doi)}` : ''}.`;
      }
    }
    // Book or report (organisation or authors)
    switch (style) {
      case 'apa7': return `${who ? who + ' ' : ''}(${y}). <i>${T}</i>.${pub && pub !== esc(src.org || '') ? ` ${pub}.` : ''}${doi ? ` https://doi.org/${esc(doi)}` : ''}`;
      case 'ieee': return `[${n}] ${who ? who + ', ' : ''}<i>${T}</i>.${pl || pub ? ` ${[pl, pub].filter(Boolean).join(': ')},` : ''} ${y}.`;
      case 'chicago': return `${who ? who + '. ' : ''}${y}. <i>${T}</i>.${pl || pub ? ` ${[pl, pub].filter(Boolean).join(': ')}.` : ''}`;
      case 'vancouver': return `${n}. ${who ? who + '. ' : ''}${T}.${pl || pub ? ` ${[pl, pub].filter(Boolean).join(': ')};` : ''} ${y}.`;
      case 'aglc4': return `${who ? who + ', ' : ''}<i>${T}</i> (${[type === 'report' ? 'Report' : pub, y].filter(Boolean).join(', ')})`;
      default: return `${who || `<i>${T}</i>`} (${y})${who ? ` <i>${T}</i>` : ''}${pub ? `, ${pub}` : ''}${pl ? `, ${pl}` : ''}.`;
    }
  }

  /** Ordered reference list for a set of sources */
  function referenceList(sources, style = state.user.citation) {
    const p = currentProject();
    const numbered = NUMERIC_STYLES.includes(style);
    const list = sources.map(s => ({ s, n: p.sources.indexOf(s) + 1 }));
    if (!numbered) {
      list.sort((x, y) => sortKey(x.s).localeCompare(sortKey(y.s)));
    } else list.sort((x, y) => x.n - y.n);
    return list.map(({ s, n }) => ({ src: s, html: reference(s, style, n) }));
  }
  const sortKey = (s) => (s.org || (s.authors && s.authors[0] && s.authors[0].family) || s.title).toLowerCase();
  const sourceNumber = (src) => Math.max(1, (currentProject()?.sources || []).indexOf(src) + 1);
  const stripTags = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; };

  /* ------------------------------------------------------
     4. STATE + PERSISTENCE
     ------------------------------------------------------ */
  /* A new account starts empty: no projects, no activity */
  function seedState() {
    return {
      version: STATE_VERSION,
      lang: state0Lang(),
      seenLanding: false,
      tourDone: false,
      user: { name: '', university: 'RMIT University', program: '', citation: 'rmit-harvard', showAiLabels: true },
      currentProjectId: null,
      projects: [],
      saved: {},
      outlines: {},
      activity: [],
      userEvidence: {},
      maps: {},
      guidesHidden: {}
    };
  }

  function state0Lang() {
    return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === STATE_VERSION) return parsed;
      }
    } catch (err) { /* storage unavailable, fall back to seed */ }
    return seedState();
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
  }

  let state = loadState();
  state.userEvidence ||= {};
  state.maps ||= {};
  state.guidesHidden ||= {};
  // Older saves may still contain the removed sample project: drop it
  if (state.projects.some(p => p.isSample)) {
    state.projects = state.projects.filter(p => !p.isSample);
    delete state.saved.p1; delete state.outlines.p1;
    state.activity = state.activity.filter(a => a.projectId !== 'p1');
    if (!state.projects.some(p => p.id === state.currentProjectId)) state.currentProjectId = state.projects[0] ? state.projects[0].id : null;
    persist();
  }

  /* Transient UI state (not persisted) */
  const ui = {
    lib: { query: '', theme: 'all', source: 'all', tab: 'all' },
    answer: null,
    asking: false,
    mapSelected: null,
    mapFilters: { theme: true, similar: true, different: true, contradicts: true },
    editingThesis: false,
    editingArg: null,
    newArgId: null,
    projectSearch: '',
    pendingFiles: [],
    refStyle: null,
    resultCache: {},
    refSources: null
  };

  /* ------------------------------------------------------
     5. HELPERS
     ------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };

  /** Translate a UI key, with {placeholders} */
  function t(key, params = {}) {
    const entry = STR[key];
    let s = entry ? entry[state.lang === 'vi' ? 1 : 0] : key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? L(params[k]) : `{${k}}`));
  }
  /** Localise a value that may be a plain string or { en, vi } */
  function L(v) {
    if (v && typeof v === 'object' && ('en' in v || 'vi' in v)) return v[state.lang] ?? v.en;
    return v ?? '';
  }

  function fileToTitle(name) {
    return name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function formatSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  const locale = () => state.lang === 'vi' ? 'vi-VN' : 'en-GB';
  function relTime(ts) {
    const min = Math.round((Date.now() - ts) / 6e4);
    if (min < 1) return t('time.now');
    if (min < 60) return t('time.min', { n: min });
    const h = Math.round(min / 60);
    if (h < 24) return t(h === 1 ? 'time.hour' : 'time.hours', { n: h });
    const d = Math.round(h / 24);
    if (d === 1) return t('time.yesterday');
    if (d < 7) return t('time.days', { n: d });
    return new Date(ts).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function highlight(text, query) {
    const safe = esc(text);
    if (!query) return safe;
    const terms = query.trim().split(/\s+/).filter(x => x.length > 1).map(x => esc(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!terms.length) return safe;
    return safe.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
  }
  const plural = (n, one, many) => n === 1 ? t(one) : t(many, { n });

  const currentProject = () => state.projects.find(p => p.id === state.currentProjectId) || state.projects[0] || null;
  /* A project's evidence = the passages the student saved from their own PDFs */
  const projectEvidence = (pid = currentProject()?.id) => (pid ? savedList(pid).map(evidenceById).filter(Boolean) : []);
  const savedList = (pid = currentProject()?.id) => pid ? (state.saved[pid] ||= []) : [];
  const isSaved = (id) => savedList().includes(id);
  const evidenceById = (id) => ui.resultCache[id] || Object.values(state.userEvidence || {}).map(m => m[id]).find(Boolean) || null;
  const sourceOf = (ev) => {
    const p = state.projects.find(x => x.id === ev.projectId);
    return (p && p.sources.find(s => s.id === ev.sourceId)) || { id: ev.sourceId, file: '?', title: '?', authors: [] };
  };
  const shortCite = (ev) => inText(sourceOf(ev), ev.page, state.user.citation, sourceNumber(sourceOf(ev)));
  const evidenceCountFor = (p) => savedList(p.id).length;
  const outlineFor = (pid = currentProject()?.id) => (state.outlines[pid] ||= { thesis: '', args: [] });

  function touchProject(pid = currentProject().id) {
    const p = state.projects.find(x => x.id === pid);
    if (p) p.updated = Date.now();
  }
  function logActivity(icon, key, params = {}, pid = currentProject()?.id) {
    state.activity.unshift({ icon, key, params, projectId: pid, time: Date.now() });
    state.activity = state.activity.slice(0, 25);
  }
  function commit() { persist(); updateShell(); }
  const truncate = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  function toast(message, { icon = 'check', type = '' } = {}) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i data-lucide="${icon}"></i><span>${esc(message)}</span>`;
    $('#toasts').appendChild(el);
    icons();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, 2800);
  }

  function copyText(txt, done) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast(t('b.copyFail'), { icon: 'x', type: 'warn' }); }
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
  }

  /* Apply translations to static markup in index.html */
  function applyStaticI18n() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-action="set-lang"]').forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
  }

  /* ------------------------------------------------------
     6. ROUTER & SHELL
     ------------------------------------------------------ */
  const PAGES = ['home', 'dashboard', 'projects', 'evidence', 'map', 'builder', 'settings'];
  const RENDERERS = {
    dashboard: renderDashboard, projects: renderProjects, evidence: renderEvidence,
    map: renderMap, builder: renderBuilder, settings: renderSettings
  };

  const currentPage = () => {
    const h = location.hash.replace('#', '');
    if (PAGES.includes(h)) return h;
    return state.seenLanding ? 'dashboard' : 'home';
  };
  function navigate(page) {
    if (location.hash === '#' + page) renderPage();
    else location.hash = page;
  }

  function renderPage({ keepScroll = false } = {}) {
    const page = currentPage();
    applyStaticI18n();
    const onLanding = page === 'home';
    $('#landing').hidden = !onLanding;
    $('#app').hidden = onLanding;
    if (onLanding) {
      renderLanding();
    } else {
      $$('.page').forEach(s => s.classList.toggle('active', s.id === 'page-' + page));
      $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.page === page));
      if (!currentProject() && ['evidence', 'map', 'builder'].includes(page)) renderNoProject(page);
      else RENDERERS[page]();
      attachGuide(page);
      updateShell();
      closeSidebar();
    }
    icons();
    if (!keepScroll) window.scrollTo({ top: 0 });
  }
  const refresh = () => renderPage({ keepScroll: true });

  /* ---------- Page guides: little pictures of the real controls, with a few words each ---------- */
  const gv = {
    btn: (icon, label, cls = 'btn-outline') => `<span class="btn btn-sm ${cls}"><i data-lucide="${icon}"></i>${esc(label)}</span>`,
    search: (text) => `<span class="gv-search"><i data-lucide="search"></i><span class="gv-typing">${esc(text)}</span></span>`,
    card: (inner) => `<span class="gv-card"><span class="gv-line"></span><span class="gv-line short"></span>${inner || ''}</span>`,
    cursor: (cls = '') => `<span class="gv-cursor ${cls}"><i data-lucide="mouse-pointer-2"></i></span>`
  };
  const GUIDES = {
    dashboard: [
      () => gv.btn('plus', t('dash.create'), 'btn-primary'),
      () => `<span class="gv-steps">${[1, 2, 3, 4].map(n => `<span class="${n < 3 ? 'done' : ''}">${n < 3 ? '<i data-lucide="check"></i>' : n}</span>`).join('')}</span>`,
      () => `<span class="gv-select"><i data-lucide="folder"></i>${esc(t('top.currentProject'))}<i data-lucide="chevron-down"></i></span>`
    ],
    projects: [
      () => `<span class="gv-card wide"><span class="course-tag">COMM1078</span><span class="gv-line"></span><span class="gv-line short"></span></span>${gv.cursor('tap')}`,
      () => gv.search('ENVI2205'),
      () => `<span class="icon-btn sm danger gv-bin"><i data-lucide="trash-2"></i></span>`
    ],
    evidence: [
      () => gv.btn('file-up', t('lib.addPdf')),
      () => gv.search('wayang culture'),
      () => gv.card(gv.btn('bookmark-plus', t('ev.save'))) ,
      () => `<span class="gv-card"><span class="gv-line"></span><span class="gv-warn"><i data-lucide="circle-alert"></i>${esc(t('src.needsDetails'))}</span></span>`
    ],
    map: [
      () => `<span class="gv-row">${gv.card()}${gv.card()}</span>`,
      () => `<span class="theme-node gv-theme" style="--c:#5260c8"><span class="dot"></span>${esc(t('map.themeN', { n: 1 }))}<i data-lucide="pencil"></i></span>`,
      () => `<svg class="gv-link" viewBox="0 0 160 60" aria-hidden="true"><rect x="4" y="14" width="44" height="32" rx="6"/><rect x="112" y="14" width="44" height="32" rx="6"/><line x1="48" y1="30" x2="112" y2="30"/></svg>${gv.cursor('link')}`,
      () => `<span class="gv-badges">${['similar', 'different', 'contradicts'].map(tp => `<span class="conn-badge ${tp}"><i data-lucide="${CONN_ICONS[tp]}"></i>${esc(t('conn.' + tp))}</span>`).join('')}</span>`,
      () => `<span class="gv-drag">${gv.card()}${gv.cursor('drag')}</span>`,
      () => `<span class="gv-suggest"><svg viewBox="0 0 70 10" aria-hidden="true"><line x1="2" y1="5" x2="68" y2="5"/></svg><span class="icon-btn sm"><i data-lucide="check"></i></span><span class="icon-btn sm"><i data-lucide="x"></i></span></span>`
    ],
    builder: [
      () => `<span class="gv-thesis"><i data-lucide="target"></i><span class="gv-line"></span></span>`,
      () => gv.btn('plus', t('b.add'), 'btn-primary'),
      () => `<span class="gv-drag into">${gv.card()}<i data-lucide="arrow-right" class="gv-arrow"></i><span class="gv-slot"></span>${gv.cursor('drag')}</span>`,
      () => gv.btn('copy', t('b.copy'))
    ],
    settings: [
      () => `<span class="gv-select">RMIT Harvard<i data-lucide="chevron-down"></i></span>`,
      () => `<span class="lang-switch"><button class="${state.lang === 'en' ? 'active' : ''}" tabindex="-1">EN</button><button class="${state.lang === 'vi' ? 'active' : ''}" tabindex="-1">VI</button></span>`,
      () => gv.btn('trash-2', t('set.reset'), 'btn-danger')
    ]
  };
  function guideBlock(page) {
    const steps = GUIDES[page];
    if (!steps || state.guidesHidden[page]) return '';
    return `
      <section class="guide" aria-label="${t('g.button')}">
        <div class="guide-head">
          <h2><i data-lucide="book-open"></i>${t(`g.${page}.t`)}</h2>
          <button class="btn btn-ghost btn-sm" data-action="hide-guide" data-page="${page}"><i data-lucide="check"></i>${t('g.gotIt')}</button>
        </div>
        <ol class="guide-tiles">
          ${steps.map((visual, i) => `
            <li class="guide-tile">
              <span class="guide-num">${i + 1}</span>
              <span class="guide-visual" aria-hidden="true">${visual()}</span>
              <span class="guide-cap">${t(`g.${page}.${i + 1}`)}</span>
            </li>`).join('')}
        </ol>
      </section>`;
  }
  /* Adds the guide under the page heading, plus a button to show or hide it */
  function attachGuide(page) {
    if (!GUIDES[page]) return;
    const section = $('#page-' + page);
    const anchor = section.querySelector('.page-header') || section.querySelector('.welcome');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', guideBlock(page));
    const hidden = state.guidesHidden[page];
    const btn = `<button class="btn btn-ghost btn-sm guide-toggle ${hidden ? '' : 'on'}" data-action="toggle-guide" data-page="${page}" aria-pressed="${!hidden}"><i data-lucide="book-open"></i>${t('g.button')}</button>`;
    let actions = anchor.querySelector('.actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'actions';
      anchor.appendChild(actions);
    }
    actions.insertAdjacentHTML('afterbegin', btn);
  }

  function updateShell() {
    const p = currentProject();
    const sel = $('#projectSelect');
    sel.disabled = !p;
    sel.innerHTML = p
      ? state.projects.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(L(x.title))}</option>`).join('')
      : `<option>${t('top.noProject')}</option>`;
    const n = savedList().length;
    $('#navSavedCount').textContent = n ? n : '';
    const name = state.user.name.trim();
    $('#avatar').innerHTML = name ? esc(name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()) : '<i data-lucide="user"></i>';
    $('#profileName').textContent = name || t('user.guest');
    $('#profileUni').textContent = state.user.university;
    if (!p) { $('#sidebarProject').innerHTML = ''; icons(); return; }
    const prog = projectProgress(p);
    $('#sidebarProject').innerHTML = `
      <div class="side-project">
        <small>${t('side.active')}</small>
        <strong>${esc(L(p.title))}</strong>
        <div class="progress"><span style="width:${prog.pct}%"></span></div>
        <div class="progress-label"><span>${t('side.stages', { n: prog.done })}</span><span>${prog.pct}%</span></div>
      </div>`;
  }

  function projectProgress(p) {
    const outline = state.outlines[p.id];
    const stages = [p.sources.length > 0, evidenceCountFor(p) > 0, !!(state.maps[p.id] && state.maps[p.id].themes.length), !!(outline && outline.args.length)];
    const done = stages.filter(Boolean).length;
    return { stages, done, pct: Math.round(done / 4 * 100) };
  }

  const isNarrow = () => window.matchMedia('(max-width: 1024px)').matches;
  function openSidebar() { $('.app').classList.add('nav-open'); }
  function closeSidebar() { $('.app').classList.remove('nav-open'); }

  function setLang(lang) {
    if (state.lang === lang) return;
    state.lang = lang;
    ui.answer = null;
    persist();
    refresh();
    if (tour) positionTour();
  }

  /* ------------------------------------------------------
     7. LANDING PAGE
     ------------------------------------------------------ */
  function renderLanding() {
    const s1 = EXAMPLE_SOURCE;
    const styleRow = (st) => `
      <div class="ref-sample">
        <span class="ref-style">${CITATION_STYLES[st].label}</span>
        <code>${esc(inText(s1, 9, st, 1))}</code>
        <p>${reference(s1, st, 1)}</p>
      </div>`;

    $('#landing').innerHTML = `
      <header class="l-nav">
        <div class="l-wrap l-nav-inner">
          <a class="brand" href="#home">
            <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="8" fill="currentColor"/><path d="M9 22 L15 13 L23 18" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="22" r="2.6" fill="#fff"/><circle cx="15" cy="13" r="2.6" fill="#fff"/><circle cx="23" cy="18" r="2.6" fill="#fff"/></svg></span>
            <span class="brand-text"><strong>Trace &amp; Think</strong></span>
          </a>
          <nav class="l-links">
            <a href="#" data-action="scroll-to" data-target="l-how">${t('l.how')}</a>
            <a href="#" data-action="scroll-to" data-target="l-features">${t('l.features')}</a>
            <a href="#" data-action="scroll-to" data-target="l-rmit">${t('l.rmit')}</a>
          </nav>
          <div class="l-nav-actions">
            <div class="lang-switch" role="group" aria-label="Language">
              <button data-action="set-lang" data-lang="en" class="${state.lang === 'en' ? 'active' : ''}">EN</button>
              <button data-action="set-lang" data-lang="vi" class="${state.lang === 'vi' ? 'active' : ''}">VI</button>
            </div>
            <button class="btn btn-outline btn-sm l-open" data-action="enter-app">${t('l.open')}</button>
          </div>
        </div>
      </header>

      <section class="l-hero">
        <div class="l-wrap l-hero-grid">
          <div>
            <p class="l-eyebrow"><i data-lucide="graduation-cap"></i>${t('l.eyebrow')}</p>
            <h1>${t('l.h1a')}<br><span>${t('l.h1b')}</span></h1>
            <p class="l-lead">${t('l.lead')}</p>
            <div class="l-cta">
              <button class="btn btn-primary btn-lg" data-action="enter-app" data-tour-start="1">${t('l.cta')}<i data-lucide="arrow-right"></i></button>
              <button class="btn btn-outline btn-lg" data-action="scroll-to" data-target="l-how">${t('l.cta2')}</button>
            </div>
            <p class="l-note">${t('l.ctaNote')}</p>
          </div>

          <div class="l-preview" aria-hidden="true">
            <div class="l-preview-q"><i data-lucide="message-square"></i>${t('l.mockQ')}</div>
            <div class="evidence-card">
              <div class="ev-tags"><span class="tag"><span class="dot" style="--c:#357d97"></span>${t('l.mockTheme')}</span><span class="saved-badge"><i data-lucide="bookmark-check"></i>${t('ev.savedBadge')}</span></div>
              <h3>${t('l.mockTitle')}</h3>
              <blockquote class="ev-excerpt"><span class="label-src"><i data-lucide="quote"></i>${t('ev.excerpt')}</span><p>“${highlight(EXAMPLE_EXCERPT, 'smartphone lights-out sleep')}”</p></blockquote>
              <div class="ev-foot">
                <span class="ev-src"><i data-lucide="file-text"></i><span>${esc(s1.file)}</span></span>
                <span class="page-pill">${t('common.page', { n: 5 })}</span>
                <span class="ev-cite">${esc(inText(s1, 5, 'rmit-harvard'))}</span>
              </div>
            </div>
            <p class="l-preview-note">${t('l.mockNote')}</p>
          </div>
        </div>
      </section>

      <section class="l-section">
        <div class="l-wrap">
          <div class="l-head"><h2>${t('l.probT')}</h2><p>${t('l.probS')}</p></div>
          <div class="l-grid3">
            ${[['layers', 'l.p1t', 'l.p1b'], ['file-question', 'l.p2t', 'l.p2b'], ['bot', 'l.p3t', 'l.p3b']].map(([ic, a, b]) => `
              <div class="l-card"><span class="l-icon muted"><i data-lucide="${ic}"></i></span><h3>${t(a)}</h3><p>${t(b)}</p></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="l-section l-alt" id="l-how">
        <div class="l-wrap">
          <div class="l-head"><h2>${t('l.howT')}</h2><p>${t('l.howS')}</p></div>
          <ol class="l-steps">
            ${[['folder-plus', 'l.h1t', 'l.h1d'], ['library', 'l.h2t', 'l.h2d'], ['waypoints', 'l.h3t', 'l.h3d'], ['list-tree', 'l.h4t', 'l.h4d']].map(([ic, a, b], i) => `
              <li class="l-step"><span class="l-step-num">${i + 1}</span><span class="l-icon"><i data-lucide="${ic}"></i></span><h3>${t(a)}</h3><p>${t(b)}</p></li>`).join('')}
          </ol>
        </div>
      </section>

      <section class="l-section" id="l-features">
        <div class="l-wrap">
          <div class="l-head"><h2>${t('l.featT')}</h2></div>
          <div class="l-grid3">
            ${[['file-search', 'l.f1t', 'l.f1d'], ['sparkles', 'l.f2t', 'l.f2d'], ['waypoints', 'l.f3t', 'l.f3d'], ['list-tree', 'l.f4t', 'l.f4d'], ['book-marked', 'l.f5t', 'l.f5d'], ['languages', 'l.f6t', 'l.f6d']].map(([ic, a, b]) => `
              <div class="l-card"><span class="l-icon"><i data-lucide="${ic}"></i></span><h3>${t(a)}</h3><p>${t(b)}</p></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="l-section l-alt" id="l-rmit">
        <div class="l-wrap l-rmit">
          <div>
            <h2>${t('l.rmitT')}</h2>
            <p class="l-sub">${t('l.rmitS')}</p>
            <ul class="l-checks">
              ${['l.r1', 'l.r2', 'l.r3', 'l.r4'].map(k => `<li><i data-lucide="circle-check"></i>${t(k)}</li>`).join('')}
            </ul>
          </div>
          <div class="panel l-refs">
            <h3>${t('l.sampleRef')}</h3>
            ${['rmit-harvard', 'apa7', 'ieee'].map(styleRow).join('')}
          </div>
        </div>
      </section>

      <section class="l-section l-final">
        <div class="l-wrap">
          <h2>${t('l.finalT')}</h2>
          <p>${t('l.finalS')}</p>
          <button class="btn btn-primary btn-lg" data-action="enter-app" data-tour-start="1">${t('l.cta')}<i data-lucide="arrow-right"></i></button>
        </div>
      </section>

      <footer class="l-footer"><div class="l-wrap">© 2026 Trace &amp; Think · ${t('l.footer')}</div></footer>`;
  }

  function enterApp() {
    const firstTime = !state.seenLanding;
    state.seenLanding = true;
    persist();
    navigate('dashboard');
    if (firstTime || !state.tourDone) setTimeout(startTour, 250);
  }

  /* ------------------------------------------------------
     8. APP PAGE RENDERERS
     ------------------------------------------------------ */

  /* ---------- Shared: project card ---------- */
  function projectCard(p, { deletable = false } = {}) {
    const isCurrent = p.id === state.currentProjectId;
    const title = L(p.title);
    return `
      <article class="project-card ${isCurrent ? 'current' : ''}" data-action="open-project" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(title)}">
        <div class="pc-top">
          ${p.course ? `<span class="course-tag">${esc(p.course)}</span>` : '<span></span>'}
          ${deletable ? `<button class="icon-btn sm danger pc-delete" data-action="delete-project" data-id="${p.id}" aria-label="${t('proj.delete')}"><i data-lucide="trash-2"></i></button>` : ''}
        </div>
        <h3>${esc(title)}</h3>
        <p class="pc-q">${esc(L(p.question) || L(p.description) || t('proj.noQuestion'))}</p>
        <div class="pc-meta">
          <span><i data-lucide="file-text"></i>${plural(p.sources.length, 'common.source1', 'common.sources')}</span>
          <span><i data-lucide="bookmark"></i>${t('common.evCards', { n: evidenceCountFor(p) })}</span>
        </div>
        <div class="pc-foot">
          <span>${t('common.edited', { t: relTime(p.updated) })}</span>
          ${isCurrent ? `<span class="active-badge">${t('common.active')}</span>` : ''}
        </div>
      </article>`;
  }

  /* ---------- Shared: evidence card ---------- */
  function evidenceCard(ev, { query = '' } = {}) {
    const saved = isSaved(ev.id);
    const src = sourceOf(ev);
    query = (ev.terms || []).join(' ') || query;   // highlight the words that matched in the PDF passage
    const th = saved ? themeOf(ev) : null;
    const tags = th ? `<span class="tag"><span class="dot" style="--c:${th.color}"></span>${esc(th.name)}</span>` : '';
    return `
      <article class="evidence-card ${saved ? 'is-saved' : ''}" id="card-${ev.id}">
        <header class="ev-head">
          <div>
            <div class="ev-tags">${tags}${saved ? `<span class="saved-badge"><i data-lucide="bookmark-check"></i>${t('ev.savedBadge')}</span>` : ''}</div>
            <h3>${highlight(L(ev.title), query)}</h3>
          </div>
          ${saved
            ? `<button class="btn btn-sm btn-danger" data-action="toggle-save" data-id="${ev.id}"><i data-lucide="bookmark-minus"></i>${t('ev.remove')}</button>`
            : `<button class="btn btn-sm btn-outline" data-action="toggle-save" data-id="${ev.id}"><i data-lucide="bookmark-plus"></i>${t('ev.save')}</button>`}
        </header>
        <blockquote class="ev-excerpt">
          <span class="label-src"><i data-lucide="quote"></i>${t('ev.excerpt')}${state.lang === 'vi' ? ` <em class="lang-note">· ${t('ev.excerptNote')}</em>` : ''}</span>
          <p>“${highlight(ev.excerpt, query)}”</p>
        </blockquote>
        <footer class="ev-foot">
          <span class="ev-src" title="${esc(src.title)}"><i data-lucide="file-text"></i><span>${esc(src.file)}</span></span>
          <span class="page-pill">${t('common.page', { n: ev.page })}</span>
          <span class="ev-cite" title="${CITATION_STYLES[state.user.citation].label}">${inText(src, ev.page, state.user.citation, sourceNumber(src), true)}</span>
          <span class="ev-actions">
            ${!isComplete(src) ? `<button class="link-btn warn" data-action="edit-source" data-id="${src.id}"><i data-lucide="pencil"></i>${t('src.addDetails')}</button>` : ''}
            <button class="link-btn" data-action="copy-ref" data-source="${src.id}"><i data-lucide="copy"></i>${t('ev.copyRef')}</button>
            ${!saved ? '' : `<button class="link-btn" data-action="view-in-map" data-id="${ev.id}"><i data-lucide="waypoints"></i>${t('ev.viewMap')}</button>`}
          </span>
        </footer>
      </article>`;
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const p = currentProject();
    const hour = new Date().getHours();
    const greet = t(hour < 12 ? 'dash.morning' : hour < 18 ? 'dash.afternoon' : 'dash.evening');
    const firstName = state.user.name.split(' ')[0];
    const dateStr = new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
    const totals = {
      projects: state.projects.length,
      sources: state.projects.reduce((n, x) => n + x.sources.length, 0),
      evidence: state.projects.reduce((n, x) => n + evidenceCountFor(x), 0),
      sections: Object.values(state.outlines).reduce((n, o) => n + o.args.length, 0)
    };
    const recent = [...state.projects].sort((a, b) => b.updated - a.updated).slice(0, 3);
    const prog = p ? projectProgress(p) : null;
    const outline = p && state.outlines[p.id];
    const steps = !p ? [] : [
      { title: t('dash.s1'), meta: t('dash.s1m', { n: p.sources.length }), page: 'evidence' },
      { title: t('dash.s2'), meta: t('dash.s2m', { n: evidenceCountFor(p) }), page: 'evidence' },
      { title: t('dash.s3'), meta: (state.maps[p.id] && state.maps[p.id].themes.length) ? t('dash.s3m', { a: state.maps[p.id].themes.length, b: state.maps[p.id].links.length }) : t('dash.s3w'), page: 'map' },
      { title: t('dash.s4'), meta: outline && outline.args.length ? t('dash.s4m', { n: outline.args.length }) : t('dash.s4w'), page: 'builder' }
    ];

    $('#page-dashboard').innerHTML = `
      <div class="welcome">
        <div>
          <p class="eyebrow">${esc(dateStr)}</p>
          <h1>${greet}${firstName ? ', ' + esc(firstName) : ''}</h1>
          <p class="sub">${t('dash.sub')}</p>
        </div>
        <button class="btn btn-primary btn-lg" data-action="open-new-project"><i data-lucide="plus"></i>${t('dash.create')}</button>
      </div>

      ${!state.tourDone ? `<div class="notice notice-tour"><i data-lucide="compass"></i><span>${t('dash.newHere')}</span><button class="btn btn-primary btn-sm" data-action="start-tour">${t('dash.startTour')}</button></div>` : ''}

      <div class="stats-row">
        ${stat('folder-open', totals.projects, t('dash.statProjects'))}
        ${stat('file-text', totals.sources, t('dash.statSources'))}
        ${stat('bookmark', totals.evidence, t('dash.statEvidence'))}
        ${stat('list-tree', totals.sections, t('dash.statSections'))}
      </div>

      <div class="dash-grid">
        <div class="dash-col">
          ${!p ? emptyProjectBlock() : `
          <section class="panel workflow">
            <div class="workflow-head">
              <div>
                <p class="eyebrow">${t('dash.continue')}</p>
                <h2>${esc(L(p.title))}</h2>
                <p>${esc(L(p.question) || t('dash.noQuestion'))}</p>
              </div>
              <span class="count-pill">${t('dash.complete', { n: prog.pct })}</span>
            </div>
            <div class="steps">
              ${steps.map((s, i) => `
                <button class="step" data-action="go" data-page="${s.page}">
                  <span class="step-num">${t('dash.step', { n: i + 1 })}${prog.stages[i] ? '<span class="done"><i data-lucide="circle-check"></i></span>' : ''}</span>
                  <strong>${s.title}</strong>
                  <span class="meta">${s.meta}</span>
                </button>`).join('')}
            </div>
          </section>

          <section>
            <div class="section-head">
              <h2>${t('dash.recent')}</h2>
              <a href="#projects" class="link-btn">${t('common.viewAll')} <i data-lucide="arrow-right"></i></a>
            </div>
            <div class="project-grid">${recent.map(x => projectCard(x)).join('')}</div>
          </section>`}
        </div>

        <aside class="panel">
          <div class="panel-head"><h2>${t('dash.activity')}</h2></div>
          <div class="panel-body">
            <ul class="activity-list">
              ${state.activity.slice(0, 7).map(a => {
                const proj = state.projects.find(x => x.id === a.projectId);
                return `<li>
                  <span class="act-icon"><i data-lucide="${a.icon}"></i></span>
                  <div class="act-text">${esc(t(a.key, a.params))}<small>${proj ? esc(L(proj.title)) + ' · ' : ''}${relTime(a.time)}</small></div>
                </li>`;
              }).join('') || `<li class="act-text">${t('dash.noActivity')}</li>`}
            </ul>
          </div>
        </aside>
      </div>`;
  }
  /* Shown wherever a page needs a project but the account has none */
  function emptyProjectBlock() {
    return `
      <div class="empty empty-project">
        <div class="empty-icon"><i data-lucide="folder-plus"></i></div>
        <h3>${t('np.title')}</h3>
        <p>${t('np.sub')}</p>
        <div class="empty-actions">
          <button class="btn btn-primary" data-action="open-new-project"><i data-lucide="plus"></i>${t('dash.create')}</button>
        </div>
      </div>`;
  }
  function renderNoProject(page) {
    const titles = { evidence: 'nav.evidence', map: 'nav.map', builder: 'nav.builder' };
    $('#page-' + page).innerHTML = `<div class="page-header"><div><h1>${t(titles[page])}</h1></div></div>${emptyProjectBlock()}`;
  }

  function stat(icon, value, label) {
    return `<div class="stat"><span class="stat-icon"><i data-lucide="${icon}"></i></span><div><strong>${value}</strong><span>${label}</span></div></div>`;
  }

  /* ---------- My Projects ---------- */
  function renderProjects() {
    $('#page-projects').innerHTML = `
      <div class="page-header">
        <div><h1>${t('nav.projects')}</h1><p>${t('proj.sub')}</p></div>
        <div class="actions"><button class="btn btn-primary" data-action="open-new-project"><i data-lucide="plus"></i>${t('proj.new')}</button></div>
      </div>
      <div class="toolbar">
        <label class="search-input"><i data-lucide="search"></i><input id="projectSearch" type="search" placeholder="${t('proj.search')}" value="${esc(ui.projectSearch)}" /></label>
      </div>
      <div class="project-grid" id="projectGrid"></div>`;
    renderProjectGrid();
  }
  function renderProjectGrid() {
    const q = ui.projectSearch.toLowerCase();
    const list = [...state.projects].sort((a, b) => b.updated - a.updated)
      .filter(p => !q || [L(p.title), L(p.question), p.course, L(p.description)].join(' ').toLowerCase().includes(q));
    $('#projectGrid').innerHTML = list.map(p => projectCard(p, { deletable: true })).join('') +
      (q ? '' : `<button class="new-card" data-action="open-new-project"><span class="empty-icon"><i data-lucide="plus"></i></span>${t('proj.createCard')}</button>`) +
      (!list.length && q ? `<div class="empty" style="grid-column:1/-1"><h3>${esc(t('proj.noMatch', { q }))}</h3><p>${t('proj.tryOther')}</p></div>` : '');
    icons();
  }

  /* ---------- Evidence Library ---------- */
  function renderEvidence() {
    const p = currentProject();
    const themes = mapFor(p.id).themes;
    if (ui.lib.theme !== 'all' && !themes.some(x => x.id === ui.lib.theme)) ui.lib.theme = 'all';

    $('#page-evidence').innerHTML = `
      <div class="page-header">
        <div><h1>${t('nav.evidence')}</h1><p>${t('lib.sub')}</p></div>
        <div class="actions">
          <button class="btn btn-outline" data-action="open-refs"><i data-lucide="book-marked"></i>${t('lib.refList')}</button>
          <button class="btn btn-outline" data-action="upload-source"><i data-lucide="file-up"></i>${t('lib.addPdf')}</button>
        </div>
      </div>

      <div class="notice"><i data-lucide="scan-text"></i><span>${t('lib.realNotice')}</span></div>

      <div class="library-grid">
        <aside class="panel sources-panel">
          <div class="panel-head"><h3>${t('lib.sources')}</h3><span class="count-pill">${p.sources.length}</span></div>
          <div class="source-list" id="sourceList">${sourceListHTML(p)}</div>
          <div class="upload-row"><button class="upload-btn" data-action="upload-source"><i data-lucide="upload"></i>${t('lib.upload')}</button></div>
        </aside>

        <div class="library-main">
          <section class="panel ask-card">
            <div class="ask-title"><i data-lucide="message-square-text"></i><h2>${t('lib.ask')}</h2></div>
            <p class="sub">${t('lib.askSub')}</p>
            <form class="ask-form" id="askForm">
              <textarea id="askInput" rows="1" placeholder="${t('lib.askPh')}" aria-label="${t('lib.ask')}"></textarea>
              <button class="btn btn-primary" type="submit" ${ui.asking ? 'disabled' : ''}><i data-lucide="arrow-up"></i>${t('lib.askBtn')}</button>
            </form>
          </section>

          <div id="answerArea"></div>

          <section class="lib-toolbar">
            <div class="lib-toolbar-row">
              <div class="tabs" role="tablist">
                <button class="tab ${ui.lib.tab === 'all' ? 'active' : ''}" data-action="set-tab" data-tab="all">${t('lib.results')} <span class="count-pill" id="countAll">${passageTotal(p)}</span></button>
                <button class="tab ${ui.lib.tab === 'saved' ? 'active' : ''}" data-action="set-tab" data-tab="saved">${t('lib.saved')} <span class="count-pill" id="countSaved">${savedList().length}</span></button>
              </div>
              <label class="search-input"><i data-lucide="search"></i><input id="libSearch" type="search" placeholder="${t('lib.searchPh')}" value="${esc(ui.lib.query)}" /></label>
            </div>
            ${themes.length ? `<div class="lib-toolbar-row">
              <button class="chip ${ui.lib.theme === 'all' ? 'active' : ''}" data-action="set-theme" data-theme="all">${t('lib.allThemes')}</button>
              ${themes.map(x => `<button class="chip ${ui.lib.theme === x.id ? 'active' : ''}" data-action="set-theme" data-theme="${x.id}"><span class="dot" style="--c:${x.color}"></span>${esc(x.name)}</button>`).join('')}
            </div>` : ''}
          </section>

          <div>
            <p class="result-meta" id="resultMeta"></p>
            <div class="evidence-list" id="evidenceList" style="margin-top:10px"></div>
          </div>
        </div>
      </div>`;

    renderAnswer();
    renderEvidenceList();
  }

  /* Saved evidence (optionally filtered), or live search results across the PDFs' text */
  function filteredEvidence() {
    const q = ui.lib.query.trim().toLowerCase();
    const bySource = (e) => ui.lib.source === 'all' || e.sourceId === ui.lib.source;
    const byTheme = (e) => ui.lib.theme === 'all' || (themeOf(e) || {}).id === ui.lib.theme;
    if (ui.lib.tab === 'saved' || !q || ui.lib.theme !== 'all') {
      return projectEvidence().filter(bySource).filter(byTheme)
        .filter(e => !q || (e.excerpt + ' ' + e.title).toLowerCase().includes(q));
    }
    return searchPassages(ui.lib.query, 25, ui.lib.source);
  }

  function renderEvidenceList() {
    const container = $('#evidenceList');
    if (!container) return;
    const list = filteredEvidence();
    const p = currentProject();
    const active = [];
    if (ui.lib.source !== 'all') { const s = p.sources.find(x => x.id === ui.lib.source); if (s) active.push(s.title); }
    if (ui.lib.theme !== 'all') { const th = mapFor(p.id).themes.find(x => x.id === ui.lib.theme); if (th) active.push(th.name); }
    if (ui.lib.query) active.push(`“${ui.lib.query}”`);

    $('#resultMeta').innerHTML = (list.length === 1 ? t('lib.showing1') : t('lib.showing', { n: list.length })) +
      (active.length ? ' · ' + esc(active.join(' · ')) + ` · <button class="link-btn" data-action="clear-filters">${t('common.clearFilters')}</button>` : '');

    if (!list.length) {
      const readable = p.sources.some(s => s.status === 'ready');
      const reading = p.sources.some(s => s.status === 'reading');
      const key = !readable && !reading ? 'lib.noTextT' : ui.lib.tab === 'saved' && !ui.lib.query ? 'lib.noneSaved' : ui.lib.query || ui.lib.theme !== 'all' ? 'lib.noMatch' : 'lib.startT';
      const sub = { 'lib.noTextT': 'lib.noTextS', 'lib.noneSaved': 'lib.noneSavedSub', 'lib.noMatch': 'lib.noMatchSub', 'lib.startT': 'lib.startS' }[key];
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon"><i data-lucide="${key === 'lib.noTextT' ? 'file-up' : key === 'lib.noneSaved' ? 'bookmark' : 'search'}"></i></div>
          <h3>${t(key)}</h3>
          <p>${t(sub)}${key === 'lib.noMatch' && isVietnamese(ui.lib.query) && !docLooksVietnamese(p) ? ' ' + t('ans.tipEn') : ''}</p>
          ${key === 'lib.noTextT' ? `<button class="btn btn-primary btn-sm" data-action="upload-source"><i data-lucide="file-up"></i>${t('lib.addPdf')}</button>` : ''}
          ${key === 'lib.noMatch' ? `<button class="btn btn-outline btn-sm" data-action="clear-filters">${t('common.clearFilters')}</button>` : ''}
        </div>`;
    } else {
      container.innerHTML = list.map(e => evidenceCard(e, { query: ui.lib.query })).join('');
    }
    const cs = $('#countSaved'); if (cs) cs.textContent = savedList().length;
    icons();
  }

  function renderAnswer() {
    const area = $('#answerArea');
    if (!area) return;
    if (ui.asking) {
      area.innerHTML = `<div class="panel thinking"><span class="bars"><span></span><span></span><span></span></span>${t('lib.thinking', { n: currentProject().sources.length })}</div>`;
      return;
    }
    if (!ui.answer) { area.innerHTML = ''; return; }
    const a = ui.answer;
    let n = 0;
    const map = {};
    const body = L(a.text).replace(/\{([eu]\w+)\}/g, (_, id) => {
      if (!map[id]) map[id] = ++n;
      const ev = evidenceById(id);
      return `<sup><a data-action="jump-card" data-id="${id}" title="${ev ? esc(shortCite(ev)) : ''}">${map[id]}</a></sup>`;
    });
    const pdf = a.mode === 'pdf';
    area.innerHTML = `
      <section class="panel answer-card">
        <div class="answer-head">
          <span class="label-ai"><i data-lucide="file-search"></i>${t('lib.pdfAnswer')}</span>
          <button class="icon-btn sm" data-action="clear-answer" aria-label="${t('lib.dismiss')}"><i data-lucide="x"></i></button>
        </div>
        <div class="answer-q"><i data-lucide="message-square"></i>${esc(a.question)}</div>
        ${a.translatedQ ? `<p class="answer-meta"><i data-lucide="languages"></i>${esc(t('lib.searchedAs', { q: a.translatedQ }))}</p>` : ''}
        ${a.intro ? `<p class="answer-intro">${esc(L(a.intro))}</p>` : ''}
        <div class="answer-body">${body}</div>
        ${a.tip ? `<p class="answer-meta tip"><i data-lucide="lightbulb"></i>${esc(L(a.tip))}</p>` : ''}
        <p class="answer-disclaimer"><i data-lucide="shield-check"></i>${t('lib.pdfNote')}${a.machineTranslated && state.lang === 'vi' ? ' ' + t('lib.translatedNote') : ''}</p>
        ${a.evidence.length ? `
          <div class="answer-refs">
            <h4>${t('lib.supporting', { n: a.evidence.length })}</h4>
            <div class="evidence-list">${a.evidence.map(id => evidenceCard(evidenceById(id))).join('')}</div>
          </div>` : ''}
      </section>`;
    icons();
  }

  function askQuestion(question) {
    question = question.trim();
    if (!question || ui.asking) return;
    ui.asking = true;
    ui.answer = null;
    renderAnswer();
    const btn = $('#askForm button'); if (btn) btn.disabled = true;
    const started = Date.now();
    const work = answerFromPdfs(question);
    work.catch(err => { console.warn(err); return { question, mode: 'pdf', text: pair('ans.noPassage'), evidence: [] }; })
      .then(answer => new Promise(res => setTimeout(() => res(answer), Math.max(0, 500 - (Date.now() - started)))))
      .then(answer => {
        ui.asking = false;
        ui.answer = answer;
        logActivity('message-square', 'act.asked', { q: truncate(question) });
        touchProject();
        commit();
        renderAnswer();
        const b = $('#askForm button'); if (b) b.disabled = false;
        const area = $('#answerArea'); if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  }


  function toggleSave(id) {
    const list = savedList();
    const ev = evidenceById(id);
    const i = list.indexOf(id);
    const pid = currentProject().id;
    if (ev.user) {   // real PDF passages are stored with the project so they survive reloads
      const store = (state.userEvidence[pid] ||= {});
      if (i >= 0) delete store[id];
      else store[id] = { id: ev.id, projectId: pid, sourceId: ev.sourceId, page: ev.page, themes: [], title: ev.title, extracted: null, excerpt: ev.excerpt, terms: ev.terms || [], user: true };
    }
    if (i >= 0) {
      list.splice(i, 1);
      toast(t('ev.removedToast'), { icon: 'bookmark-minus' });
      logActivity('bookmark-minus', 'act.removed', { t: ev.title });
    } else {
      list.push(id);
      toast(t('ev.savedToast'), { icon: 'bookmark-check' });
      logActivity('bookmark-plus', 'act.saved', { t: ev.title });
    }
    touchProject();
    commit();
  }

  /* ======================================================
     REAL DOCUMENT READING: everything runs in the browser
     • PDF.js extracts the text layer page by page
     • Tesseract.js OCRs pages that are only images (scans)
     • MiniSearch ranks passages for search and questions
     • Chrome's on-device Translator API (when available)
       bridges Vietnamese questions and English documents
     ====================================================== */
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const OCR_MAX_PAGES = 40;
  const PASSAGES = new Map();            // sourceId → { sourceId, passages: [{ i, page, text }] }
  let indexCache = { key: '', index: null };
  let readQueue = Promise.resolve();

  const VI_CHARS = /[ăâđêôơưạảãàáẹẻẽèéịỉĩìíọỏõòóụủũùúỵỷỹỳýấầẩẫậắằẳẵặếềểễệốồổỗộớờởỡợứừửữự]/i;
  const isVietnamese = (s) => VI_CHARS.test(s || '');
  const STOP = new Set(('the a an and or of to in on for with by is are was were be been being how what why when where who whom which does do did that this these those it its as at from about into than then there their they them can could would should may might has have had not no vs ' +
    'và của là có các những như thế nào gì sao tại về này đó một được không cho với trong đến thì mà hay hoặc ra lên khi đã đang sẽ bị nó họ ở ảnh hưởng nhau rằng vậy nhé hả ạ bạn tôi mình').split(/\s+/));
  const queryTerms = (q) => [...new Set((q || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(x => x.length > 2 && !STOP.has(x)))];
  const pair = (key, params = {}) => {
    const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
    return { en: fill(STR[key][0]), vi: fill(STR[key][1]) };
  };
  const isUserProject = (p = currentProject()) => !!p;
  const passageTotal = (p = currentProject()) => (p ? p.sources.reduce((n, s) => n + (s.status === 'ready' ? (s.passageCount || 0) : 0), 0) : 0);
  const themeColor = (e) => { const th = themeOf(e); return th ? th.color : 'var(--border-strong)'; };

  /* Tiny IndexedDB wrapper: extracted text is too large for localStorage */
  const idb = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('traceThink', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('passages', { keyPath: 'sourceId' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const run = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const tx = db.transaction('passages', mode);
        const req = fn(tx.objectStore('passages'));
        tx.oncomplete = () => res(req && req.result);
        tx.onerror = () => rej(tx.error);
      });
    };
    return {
      put: (rec) => run('readwrite', s => s.put(rec)),
      del: (id) => run('readwrite', s => s.delete(id)),
      all: () => run('readonly', s => s.getAll()),
      clear: () => run('readwrite', s => s.clear())
    };
  })();

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  /* Normalise a page's text and split it into ~350–600 character passages */
  function chunkPage(raw) {
    const text = raw.replace(/-\n(?=\p{Ll})/gu, '').replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (text.replace(/\s/g, '').length < 30) return [];
    const sentences = text.match(/[^.!?。]+[.!?。]+["”’)\]]*|[^.!?。]+$/g) || [text];
    const out = [];
    let buf = '';
    for (const s of sentences) {
      const sent = s.trim();
      if (!sent) continue;
      if (buf && buf.length + sent.length > 600) { out.push(buf); buf = ''; }
      buf += (buf ? ' ' : '') + sent;
      if (buf.length >= 350) { out.push(buf); buf = ''; }
    }
    if (buf) { if (out.length && buf.length < 120) out[out.length - 1] += ' ' + buf; else out.push(buf); }
    // Hard-split very long runs (e.g. tables without punctuation)
    return out.flatMap(p => {
      if (p.length <= 900) return [p];
      const parts = []; let rest = p;
      while (rest.length > 700) { const cut = rest.lastIndexOf(' ', 600); parts.push(rest.slice(0, cut > 200 ? cut : 600)); rest = rest.slice(cut > 200 ? cut + 1 : 600); }
      parts.push(rest);
      return parts;
    }).filter(p => p.length >= 50);
  }
  const splitSentences = (text) => (text.match(/[^.!?。]+[.!?。]+["”’)\]]*|[^.!?。]+$/g) || [text]).map(s => s.trim()).filter(Boolean);

  function queueRead(pid, src, file) {
    src.status = 'reading'; src.progress = 0;
    readQueue = readQueue.then(() => readPdf(pid, src, file)).catch(err => console.warn(err));
  }

  async function readPdf(pid, src, file) {
    src.status = 'reading'; src.progress = 0; src.ocr = false;
    persist(); updateSourcesUI();
    let ocrUsed = 0;
    try {
      if (!window.pdfjsLib) throw new Error('PDF.js did not load');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      src.pages = pdf.numPages;
      try {
        const meta = await pdf.getMetadata();
        const title = meta && meta.info && meta.info.Title;
        if (title && title.trim().length > 4 && !/^(untitled|microsoft word|document\d*|slide \d+)/i.test(title.trim())) src.title = title.trim();
        const authors = parseAuthorField(meta && meta.info && meta.info.Author);
        if (authors.length && !hasMeta(src)) src.authors = authors;
      } catch (e) { /* metadata is optional */ }
      let foundDoi = null;

      const passages = [];
      const scanned = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const text = content.items.map(it => it.str + (it.hasEOL ? '\n' : ' ')).join('');
        if (n <= 2 && !foundDoi) foundDoi = findDoi(text);
        const chunks = chunkPage(text);
        if (chunks.length) chunks.forEach(c => passages.push({ i: passages.length, page: n, text: c }));
        else scanned.push(n);
        src.progress = Math.round(n / pdf.numPages * (scanned.length ? 50 : 100));
        if (n % 2 === 0 || n === pdf.numPages) updateSourcesUI();
      }

      // Pages with no text layer are images: recognise them with OCR
      if (scanned.length) {
        const toOcr = scanned.slice(0, OCR_MAX_PAGES);
        src.ocr = true; updateSourcesUI();
        if (!window.Tesseract) await loadScript(TESSERACT_URL);
        const worker = await window.Tesseract.createWorker(['eng', 'vie']);
        for (let k = 0; k < toOcr.length; k++) {
          const page = await pdf.getPage(toOcr[k]);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          const { data } = await worker.recognize(canvas);
          chunkPage(data.text || '').forEach(c => passages.push({ i: passages.length, page: toOcr[k], text: c }));
          ocrUsed++;
          src.progress = 50 + Math.round((k + 1) / toOcr.length * 50);
          updateSourcesUI();
        }
        await worker.terminate();
        if (scanned.length > OCR_MAX_PAGES) toast(t('src.ocrLimit', { n: OCR_MAX_PAGES }), { icon: 'info', type: 'warn' });
        passages.sort((a, b) => a.page - b.page).forEach((p, i) => { p.i = i; });
      }

      const rec = { sourceId: src.id, passages };
      PASSAGES.set(src.id, rec);
      try { await idb.put(rec); } catch (e) { /* storage full or blocked, keep in memory */ }
      src.passageCount = passages.length;
      src.ocrPages = ocrUsed;
      src.status = passages.length ? 'ready' : 'no-text';
      if (!foundDoi && passages.length) foundDoi = findDoi(passages.slice(0, 6).map(x => x.text).join(' '));
      if (foundDoi && !src.doiChecked) {
        src.doiChecked = true;
        const ok = await applyDoi(src, foundDoi);
        if (ok) toast(t('src.doiFound', { f: src.file }), { icon: 'badge-check' });
      }
      if (passages.length) toast(t(ocrUsed ? 'src.doneOcr' : 'src.done', { f: src.file, n: passages.length }), { icon: 'file-check' });
      else toast(t('src.failed', { f: src.file }), { icon: 'triangle-alert', type: 'warn' });
    } catch (err) {
      console.warn('PDF read failed', err);
      src.status = 'error';
      toast(t('src.failed', { f: src.file }), { icon: 'triangle-alert', type: 'warn' });
    }
    delete src.progress; delete src.ocr;
    indexCache.key = '';
    touchProject(pid);
    persist();
    updateSourcesUI();
    if (currentPage() === 'evidence' && currentProject() && currentProject().id === pid) renderEvidenceList();
  }

  /* ---------- Reference details: PDF metadata, DOI → CrossRef, manual editing ---------- */
  const DOI_RE = /\b(10\.\d{4,9}\/[^\s"<>]+)/i;
  function findDoi(text) {
    const m = (text || '').match(DOI_RE);
    return m ? m[1].replace(/[).,;:\]]+$/, '') : null;
  }

  /* "Hartley, James; Chen, Lin" · "James Hartley and Lin Chen" · "J. Hartley, L. Chen" → [{ family, given }] */
  function parseAuthorField(raw) {
    if (!raw || typeof raw !== 'string') return [];
    const value = raw.trim();
    if (!value || /microsoft|adobe|acrobat|admin|user|owner|^\d+$|@/i.test(value) || value.length > 200) return [];
    const parts = value.includes(';') ? value.split(';') : value.split(/,\s*(?=\S+\s+\S)| and | & /);
    return parts.map(p => p.trim()).filter(p => /\p{L}/u.test(p) && p.length < 60).map(p => {
      if (p.includes(',')) { const [family, given] = p.split(',').map(x => x.trim()); return { family, given: given || '' }; }
      const words = p.split(/\s+/);
      return words.length === 1 ? { family: words[0], given: '' } : { family: words[words.length - 1], given: words.slice(0, -1).join(' ') };
    });
  }

  /* CrossRef's public REST API returns publication metadata for a DOI (no key needed, CORS enabled) */
  async function lookupDoi(doi) {
    const res = await withTimeout(fetch('https://api.crossref.org/works/' + encodeURIComponent(doi)), 8000);
    if (!res.ok) throw new Error('DOI not found');
    const m = (await res.json()).message;
    const dateParts = (m.issued || m['published-print'] || m['published-online'] || {})['date-parts'];
    const journal = stripTags((m['container-title'] || [])[0] || '');
    const kind = m.type || '';
    return {
      doi: m.DOI,
      title: stripTags((m.title || [])[0] || '').replace(/\s+/g, ' ').trim(),
      year: dateParts && dateParts[0] && dateParts[0][0] ? String(dateParts[0][0]) : '',
      authors: (m.author || []).filter(a => a.family || a.name).map(a => ({ family: a.family || a.name, given: a.given || '' })),
      journal,
      jAbbr: stripTags((m['short-container-title'] || [])[0] || ''),
      volume: m.volume || '',
      issue: m.issue || '',
      range: (m.page || '').replace('-', '–'),
      publisher: m.publisher || '',
      type: journal && /article|chapter|posted|proceedings/.test(kind) ? 'article' : kind === 'report' ? 'report' : 'book'
    };
  }

  async function applyDoi(src, doi) {
    try {
      const meta = await lookupDoi(doi);
      Object.assign(src, {
        doi: meta.doi, type: meta.type, year: meta.year || src.year,
        title: meta.title || src.title, journal: meta.journal, jAbbr: meta.jAbbr,
        volume: meta.volume, issue: meta.issue, range: meta.range, publisher: meta.publisher
      });
      if (meta.authors.length) { src.authors = meta.authors; delete src.org; }
      persist();
      return true;
    } catch (e) {
      src.doi = src.doi || doi;   // keep the DOI even if CrossRef had no record
      return false;
    }
  }

  /* Edit-details modal, built on demand */
  function openSourceEditor(sourceId) {
    const p = currentProject();
    const src = p && p.sources.find(s => s.id === sourceId);
    if (!src) return;
    ui.editingSource = sourceId;
    let modal = $('#srcModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'srcModal';
      modal.addEventListener('mousedown', (e) => { if (e.target === modal) closeSourceEditor(); });
      document.body.appendChild(modal);
    }
    const type = src.type || (src.journal ? 'article' : 'book');
    const authorsText = (src.authors || []).map(a => a.given ? `${a.family}, ${a.given}` : a.family).join('\n');
    modal.innerHTML = `
      <div class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="srcTitle">
        <header class="modal-head">
          <div><h2 id="srcTitle">${t('src.editTitle')}</h2><p>${esc(src.file)}</p></div>
          <button class="icon-btn" data-action="close-src" aria-label="${t('common.close')}"><i data-lucide="x"></i></button>
        </header>
        <form class="modal-body" id="srcForm" novalidate>
          <div class="field">
            <label for="sfDoi">DOI</label>
            <div class="doi-row">
              <input id="sfDoi" name="doi" value="${esc(src.doi || '')}" placeholder="10.1234/abcd.5678" />
              <button type="button" class="btn btn-outline" data-action="lookup-doi"><i data-lucide="search"></i>${t('src.lookup')}</button>
            </div>
            <small class="hint">${t('src.doiHint')}</small>
          </div>
          <div class="field-row">
            <div class="field"><label for="sfType">${t('src.type')}</label>
              <select id="sfType" name="type">
                <option value="article" ${type === 'article' ? 'selected' : ''}>${t('src.tArticle')}</option>
                <option value="book" ${type === 'book' ? 'selected' : ''}>${t('src.tBook')}</option>
                <option value="report" ${type === 'report' ? 'selected' : ''}>${t('src.tReport')}</option>
              </select></div>
            <div class="field"><label for="sfYear">${t('src.year')}</label><input id="sfYear" name="year" value="${esc(src.year || '')}" placeholder="2024" inputmode="numeric" /></div>
          </div>
          <div class="field"><label for="sfAuthors">${t('src.authors')}</label>
            <textarea id="sfAuthors" name="authors" rows="3" placeholder="Nguyen, Minh Anh&#10;Smith, John">${esc(authorsText)}</textarea>
            <small class="hint">${t('src.authorsHint')}</small></div>
          <div class="field"><label for="sfOrg">${t('src.org')}</label><input id="sfOrg" name="org" value="${esc(src.org || '')}" placeholder="UNESCO" /></div>
          <div class="field"><label for="sfTitle">${t('src.titleF')}</label><input id="sfTitle" name="title" value="${esc(src.title || '')}" /></div>
          <div class="field article-only"><label for="sfJournal">${t('src.journal')}</label><input id="sfJournal" name="journal" value="${esc(src.journal || '')}" /></div>
          <div class="field-row article-only three">
            <div class="field"><label for="sfVol">${t('src.volume')}</label><input id="sfVol" name="volume" value="${esc(src.volume || '')}" /></div>
            <div class="field"><label for="sfIss">${t('src.issue')}</label><input id="sfIss" name="issue" value="${esc(src.issue || '')}" /></div>
            <div class="field"><label for="sfPages">${t('src.pagesF')}</label><input id="sfPages" name="range" value="${esc(src.range || '')}" placeholder="45–67" /></div>
          </div>
          <div class="field-row book-only">
            <div class="field"><label for="sfPub">${t('src.publisher')}</label><input id="sfPub" name="publisher" value="${esc(src.publisher || '')}" /></div>
            <div class="field"><label for="sfPlace">${t('src.place')}</label><input id="sfPlace" name="place" value="${esc(src.place || '')}" /></div>
          </div>
          <div class="src-preview" id="srcPreview"></div>
        </form>
        <footer class="modal-foot">
          <button class="btn btn-ghost" type="button" data-action="close-src">${t('common.cancel')}</button>
          <button class="btn btn-primary" type="submit" form="srcForm"><i data-lucide="check"></i>${t('src.save')}</button>
        </footer>
      </div>`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    updateSourcePreview();
    icons();
  }
  function closeSourceEditor() {
    const m = $('#srcModal'); if (m) m.hidden = true;
    document.body.style.overflow = '';
    ui.editingSource = null;
  }
  /* Read the form into a plain source object (used for the live preview and for saving) */
  function sourceFromForm() {
    const f = $('#srcForm');
    const d = Object.fromEntries(new FormData(f));
    const authors = (d.authors || '').split('\n').map(x => x.trim()).filter(Boolean).map(line => {
      if (line.includes(',')) { const [family, given] = line.split(',').map(x => x.trim()); return { family, given: given || '' }; }
      const w = line.split(/\s+/); return w.length === 1 ? { family: w[0], given: '' } : { family: w[w.length - 1], given: w.slice(0, -1).join(' ') };
    });
    return {
      type: d.type, year: (d.year || '').trim(), title: (d.title || '').trim(), authors,
      org: authors.length ? '' : (d.org || '').trim(), journal: (d.journal || '').trim(),
      volume: (d.volume || '').trim(), issue: (d.issue || '').trim(), range: (d.range || '').trim().replace(/\s*-\s*/, '–'),
      publisher: (d.publisher || '').trim(), place: (d.place || '').trim(), doi: (d.doi || '').trim()
    };
  }
  function updateSourcePreview() {
    const f = $('#srcForm');
    if (!f) return;
    const draft = sourceFromForm();
    f.classList.toggle('is-article', draft.type === 'article');
    const style = state.user.citation;
    const src = currentProject().sources.find(s => s.id === ui.editingSource);
    const n = sourceNumber(src);
    $('#srcPreview').innerHTML = `
      <span class="label-src">${CITATION_STYLES[style].label}</span>
      <p><span>${t('ref.inText')}:</span> <code>${inText(draft, 12, style, n, true)}</code></p>
      <p class="src-preview-ref">${reference(draft, style, n)}</p>`;
  }

  /* Restore extracted text saved in IndexedDB from earlier visits */
  async function loadStoredPassages() {
    try { (await idb.all() || []).forEach(r => PASSAGES.set(r.sourceId, r)); } catch (e) { /* IndexedDB unavailable */ }
    let changed = false;
    state.projects.forEach(p => {
      p.sources.forEach(s => {
        const has = PASSAGES.has(s.id);
        if (s.status === 'reading' || (s.status === 'ready' && !has) || !s.status) {
          s.status = has ? 'ready' : 'missing';
          if (has) s.passageCount = PASSAGES.get(s.id).passages.length;
          changed = true;
        }
      });
    });
    if (changed) persist();
    if (['evidence', 'dashboard'].includes(currentPage())) refresh();
  }

  function getIndex(p) {
    if (!window.MiniSearch) return null;
    const ready = p.sources.filter(s => s.status === 'ready' && PASSAGES.has(s.id));
    const key = p.id + ':' + ready.map(s => s.id + s.passageCount).join(',');
    if (indexCache.key === key) return indexCache.index;
    const ms = new window.MiniSearch({
      fields: ['text'],
      storeFields: ['sourceId', 'page', 'text'],
      processTerm: (term) => { const x = term.toLowerCase(); return x.length < 2 || STOP.has(x) ? null : x; },
      searchOptions: { prefix: (term) => term.length > 3, fuzzy: (term) => (term.length > 5 ? 0.2 : false), combineWith: 'OR' }
    });
    ms.addAll(ready.flatMap(s => PASSAGES.get(s.id).passages.map(ps => ({ id: `u${s.id}_${ps.i}`, sourceId: s.id, page: ps.page, text: ps.text }))));
    indexCache = { key, index: ms };
    return ms;
  }

  function searchPassages(query, limit = 6, sourceFilter = 'all') {
    const p = currentProject();
    const ms = p && getIndex(p);
    if (!ms || !query.trim()) return [];
    let res = ms.search(query);
    if (sourceFilter !== 'all') res = res.filter(r => r.sourceId === sourceFilter);
    if (!res.length) return [];
    const top = res[0].score;
    return res.filter(r => r.score >= top * 0.3).slice(0, limit).map(r => toEvidence(p.id, r));
  }

  function toEvidence(pid, r) {
    const first = splitSentences(r.text)[0] || r.text;
    const title = first.length > 110 ? first.slice(0, 107).replace(/\s+\S*$/, '') + '…' : first;
    const ev = { id: r.id, projectId: pid, sourceId: r.sourceId, page: r.page, themes: [], title, extracted: null, excerpt: r.text, terms: r.terms || [], user: true };
    ui.resultCache[r.id] = ev;
    return ev;
  }

  function docLooksVietnamese(p) {
    const sample = p.sources.filter(s => PASSAGES.has(s.id)).flatMap(s => PASSAGES.get(s.id).passages.slice(0, 4).map(x => x.text)).join(' ');
    if (!sample) return false;
    const hits = (sample.match(new RegExp(VI_CHARS.source, 'gi')) || []).length;
    return hits / sample.length > 0.01;
  }

  /* Chrome's built-in, on-device Translator API (Chrome 138+). Returns null when unavailable. */
  const translators = {};
  const translatorBroken = {};
  const withTimeout = (promise, ms) => Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  async function translateText(text, from, to) {
    const key = from + '>' + to;
    if (!('Translator' in self) || translatorBroken[key] || translatorBroken.any) return null;
    try {
      if (!translators[key]) {
        const availability = await withTimeout(self.Translator.availability({ sourceLanguage: from, targetLanguage: to }), 2500);
        if (availability === 'unavailable') { translatorBroken[key] = true; return null; }
        if (availability !== 'available') {
          // Language pack not on this device yet: start the download in the background, answer without it for now
          self.Translator.create({ sourceLanguage: from, targetLanguage: to }).then(tr => { translators[key] = tr; }).catch(() => {});
          return null;
        }
        translators[key] = await withTimeout(self.Translator.create({ sourceLanguage: from, targetLanguage: to }), 5000);
      }
      return await withTimeout(translators[key].translate(text), 6000);
    } catch (e) {
      translatorBroken[key] = true;   // don't keep the student waiting on every question
      if (e && e.message === 'timeout') translatorBroken.any = true;
      return null;
    }
  }

  /* Answer a question from the project's own PDFs: rank passages, then pick the most relevant sentences */
  async function answerFromPdfs(question) {
    const p = currentProject();
    if (!p.sources.some(s => s.status === 'ready')) {
      return { question, mode: 'pdf', text: pair('ans.noText'), evidence: [] };
    }
    const docVi = docLooksVietnamese(p);
    const qVi = isVietnamese(question);
    let searchQ = question;
    let translatedQ = null;
    if (qVi && !docVi) {
      translatedQ = await translateText(question, 'vi', 'en');
      if (translatedQ) searchQ = translatedQ + ' ' + question;
    }
    const found = searchPassages(searchQ, 6);
    const tip = qVi && !docVi && !translatedQ ? pair('ans.tipEn') : null;
    if (!found.length) return { question, translatedQ, mode: 'pdf', text: pair('ans.noPassage'), tip, evidence: [] };

    const terms = queryTerms(searchQ);
    const candidates = [];
    found.forEach((ev, rank) => {
      splitSentences(ev.excerpt).forEach(s => {
        if (s.length < 40) return;
        const low = s.toLowerCase();
        const hits = terms.filter(x => low.includes(x)).length;
        if (hits) candidates.push({ s, ev, rank, score: hits + (found.length - rank) * 0.25 });
      });
    });
    candidates.sort((a, b) => b.score - a.score);
    const picked = [];
    for (const c of candidates) {
      if (picked.length >= 4) break;
      if (picked.some(x => x.s === c.s) || picked.filter(x => x.ev === c.ev).length >= 2) continue;
      picked.push(c);
    }
    if (!picked.length) picked.push({ s: splitSentences(found[0].excerpt)[0], ev: found[0], rank: 0 });
    picked.sort((a, b) => a.rank - b.rank);

    const original = picked.map(c => `${esc(c.s)} {${c.ev.id}}`).join(' ');
    let vi = null;
    if (!docVi) {
      const tr = await translateText(picked.map(c => c.s).join('\n'), 'en', 'vi');
      const lines = tr ? tr.split('\n').filter(Boolean) : [];
      if (lines.length === picked.length) vi = lines.map((l, i) => `${esc(l)} {${picked[i].ev.id}}`).join(' ');
    }
    const files = new Set(found.map(e => e.sourceId)).size;
    return {
      question, translatedQ, mode: 'pdf', tip,
      intro: pair('ans.pdfIntro', { n: found.length, f: files }),
      text: { en: original, vi: vi || original },
      machineTranslated: !!vi,
      evidence: found.map(e => e.id)
    };
  }

  /* Source list (live-updated while files are being read) */
  function sourceStatusLine(s) {
    if (s.status === 'reading') return `<span class="src-status reading"><i data-lucide="loader-circle"></i>${t(s.ocr ? 'src.ocr' : 'src.reading', { n: s.progress || 0 })}</span>`;
    if (s.status === 'no-text') return `<span class="src-status warn">${t('src.noText')}</span>`;
    if (s.status === 'error') return `<span class="src-status warn">${t('src.error')}</span>`;
    if (s.status === 'missing') return `<span class="src-status warn">${t('src.missing')}</span>`;
    if (s.status === 'ready') return `${s.pages} pp · ${t('src.passages', { n: s.passageCount || 0 })}${s.ocrPages ? ' · OCR' : ''}${isComplete(s) ? '' : ` · <span class="src-status warn">${t('src.needsDetails')}</span>`}`;
    return `${hasMeta(s) ? esc(inText(s, null, 'rmit-harvard').replace(/[()]/g, '')) : esc(s.file)}${s.pages ? ` · ${s.pages} pp` : ''}${s.size ? ` · ${s.size}` : ''}`;
  }
  function sourceListHTML(p) {
    const user = isUserProject(p);
    const counts = {};
    if (user) p.sources.forEach(s => { counts[s.id] = s.status === 'ready' ? (s.passageCount || 0) : '–'; });
    else projectEvidence(p.id).forEach(e => { counts[e.sourceId] = (counts[e.sourceId] || 0) + 1; });
    const total = user ? passageTotal(p) : projectEvidence(p.id).length;
    return `
      <button class="source-item ${ui.lib.source === 'all' ? 'active' : ''}" data-action="filter-source" data-id="all">
        <span class="file-icon all"><i data-lucide="layers"></i></span>
        <span class="source-text"><strong>${t('lib.allSources')}</strong><small>${t('lib.allSourcesSub')}</small></span>
        <span class="count-pill">${total}</span>
      </button>
      ${p.sources.map(s => `
        <div class="source-row">
          <button class="source-item ${ui.lib.source === s.id ? 'active' : ''}" data-action="filter-source" data-id="${s.id}" title="${esc(s.file)}">
            <span class="file-icon">PDF</span>
            <span class="source-text"><strong>${esc(s.title)}</strong><small>${sourceStatusLine(s)}</small>${hasMeta(s) ? `<small class="src-cite">${inText(s, null, 'rmit-harvard', 1, true)}</small>` : ''}</span>
            <span class="count-pill">${counts[s.id] ?? 0}</span>
          </button>
          <button class="icon-btn sm source-edit ${isComplete(s) ? '' : 'needs'}" data-action="edit-source" data-id="${s.id}" title="${t('src.edit')}" aria-label="${t('src.edit')}"><i data-lucide="${isComplete(s) ? 'pencil' : 'circle-alert'}"></i></button>
        </div>`).join('')}`;
  }
  function updateSourcesUI() {
    if (currentPage() !== 'evidence' || !currentProject()) return;
    const el = $('#sourceList');
    if (el) { el.innerHTML = sourceListHTML(currentProject()); icons(); }
    const all = $('#countAll');
    if (all && isUserProject()) all.textContent = passageTotal();
  }

  /* ---------- Reference list modal ---------- */
  function openRefs(sources) {
    ui.refStyle = state.user.citation;
    ui.refSources = sources || null;
    renderRefs();
    $('#refModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeRefs() { $('#refModal').hidden = true; document.body.style.overflow = ''; }
  function refSources() {
    const p = currentProject();
    return ui.refSources ? ui.refSources.map(id => p.sources.find(s => s.id === id)).filter(Boolean) : p.sources;
  }
  function renderRefs() {
    const style = ui.refStyle;
    const list = referenceList(refSources(), style);
    const first = refSources()[0];
    $('#refSub').textContent = t('ref.sub', { p: L(currentProject().title), s: CITATION_STYLES[style].label });
    $('#refBody').innerHTML = `
      <div class="field">
        <label for="refStyleSel">${t('ref.style')}</label>
        <select id="refStyleSel">${Object.entries(CITATION_STYLES).map(([k, v]) => `<option value="${k}" ${k === style ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      </div>
      ${first ? `<p class="ref-intext"><span>${t('ref.inText')}:</span> <code>${esc(inText(first, 9, style, sourceNumber(first)))}</code></p>` : ''}
      ${list.length ? `<ol class="ref-list ${NUMERIC_STYLES.includes(style) ? 'numeric' : ''}">
        ${list.map(r => `<li>${r.html}${isComplete(r.src) ? '' : `<small class="ref-warn"><i data-lucide="circle-alert"></i>${t('ref.incomplete')} <button class="link-btn" data-action="edit-source" data-id="${r.src.id}">${t('src.addDetails')}</button></small>`}</li>`).join('')}
      </ol>` : `<div class="empty" style="padding:24px"><p>${t('ref.empty')}</p></div>`}
      <p class="ref-disclaimer"><i data-lucide="info"></i><span>${t('ref.disclaimer')}</span></p>`;
    icons();
  }

  /* ---------- Insight Map (real, built from the student's saved evidence) ----------
     • Themes: suggested by clustering TF-IDF vectors of the evidence text, then renamed/edited by the student
     • "Similar" links: suggested from cosine similarity (shared key terms)
     • "Different" / "Contradicts" links: created by the student, with a note explaining why
     • Nodes can be dragged; positions are saved per project */
  const THEME_PALETTE = ['#5260c8', '#a86a32', '#357d97', '#3d8a66', '#9a4f8f', '#b5523b', '#5f7d2e', '#6b6f7d'];
  const MAP_W = 1000, MAP_H = 660;

  const mapFor = (pid = currentProject()?.id) => (state.maps[pid] ||= { themes: [], assign: {}, links: [], pos: {}, dismissed: [], seen: [] });
  function themeOf(ev) {
    const m = ev && state.maps[ev.projectId];
    const id = m && m.assign[ev.id];
    return id ? m.themes.find(x => x.id === id) || null : null;
  }

  /* Text analysis helpers */
  const stem = (w) => (w.length > 5 ? w.replace(/(ations?|ings?|ness|ments?|ities|ity|ies|es|ed|ly|s)$/, '') : w);
  function tokenize(text) {
    return (text || '').toLowerCase().split(/[^\p{L}\p{N}]+/u)
      .filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
  }
  /* TF-IDF vectors for a set of evidence; document frequencies come from every passage in the project's PDFs */
  function buildVectors(evs, p) {
    const allDocs = p.sources.filter(s => PASSAGES.has(s.id)).flatMap(s => PASSAGES.get(s.id).passages.map(x => x.text));
    const corpus = allDocs.length >= evs.length ? allDocs : evs.map(e => e.excerpt);
    const df = {};
    corpus.forEach(d => new Set(tokenize(d).map(stem)).forEach(w => { df[w] = (df[w] || 0) + 1; }));
    const N = corpus.length;
    const surface = {};
    const vecs = evs.map(e => {
      const words = tokenize(e.excerpt + ' ' + e.title);
      const tf = {};
      words.forEach(w => { const s = stem(w); tf[s] = (tf[s] || 0) + 1; (surface[s] ||= {})[w] = ((surface[s] || {})[w] || 0) + 1; });
      const v = {};
      let norm = 0;
      Object.keys(tf).forEach(w => { const x = (tf[w] / words.length) * Math.log(1 + N / (df[w] || 1)); v[w] = x; norm += x * x; });
      norm = Math.sqrt(norm) || 1;
      Object.keys(v).forEach(w => { v[w] /= norm; });
      return v;
    });
    const word = (s) => Object.entries(surface[s] || { [s]: 1 }).sort((a, b) => b[1] - a[1])[0][0];
    return { vecs, word };
  }
  function cosine(a, b) {
    let s = 0;
    const [x, y] = Object.keys(a).length < Object.keys(b).length ? [a, b] : [b, a];
    for (const k in x) if (y[k]) s += x[k] * y[k];
    return s;
  }
  function sharedTerms(a, b, word, n = 3) {
    return Object.keys(a).filter(k => b[k]).sort((k1, k2) => (b[k2] * a[k2]) - (b[k1] * a[k1])).slice(0, n).map(word);
  }

  /* Agglomerative (average-link) clustering of evidence into suggested themes */
  function suggestThemes(evs, p) {
    const { vecs, word } = buildVectors(evs, p);
    const n = evs.length;
    const sim = vecs.map(a => vecs.map(b => cosine(a, b)));
    let clusters = evs.map((_, i) => [i]);
    const target = Math.max(1, Math.min(6, Math.round(Math.sqrt(n))));
    const avg = (A, B) => { let s = 0; A.forEach(i => B.forEach(j => { s += sim[i][j]; })); return s / (A.length * B.length); };
    while (clusters.length > target) {
      let best = -1, bi = 0, bj = 1;
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
        const s = avg(clusters[i], clusters[j]);
        if (s > best) { best = s; bi = i; bj = j; }
      }
      if (best < 0.04) break;
      clusters[bi] = clusters[bi].concat(clusters[bj]);
      clusters.splice(bj, 1);
    }
    // Leftover single cards join "Other" instead of becoming one-card themes
    const groups = clusters.filter(c => c.length > 1);
    const singles = clusters.filter(c => c.length === 1).flat();
    if (singles.length) groups.push(singles);
    return groups.map((g, gi) => {
      const centroid = {};
      g.forEach(i => Object.entries(vecs[i]).forEach(([k, v]) => { centroid[k] = (centroid[k] || 0) + v; }));
      const shared = Object.entries(centroid)
        .filter(([k]) => g.length === 1 || g.filter(i => vecs[i][k]).length >= 2)
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => word(k));
      const isOther = gi === groups.length - 1 && singles.length && g === groups[groups.length - 1] && singles.length === g.length && groups.length > 1;
      const label = isOther ? t('map.other') : shared.map(w => w[0].toUpperCase() + w.slice(1)).join(' · ') || t('map.themeN', { n: gi + 1 });
      return { name: label, members: g.map(i => evs[i].id) };
    });
  }

  function autoGroup(confirmReplace) {
    const p = currentProject();
    const m = mapFor(p.id);
    const evs = projectEvidence(p.id);
    if (evs.length < 2) { toast(t('map.needTwo'), { icon: 'info', type: 'warn' }); return; }
    if (confirmReplace && m.themes.length && !confirm(t('map.regroupConfirm'))) return;
    const groups = suggestThemes(evs, p);
    m.themes = groups.map((g, i) => ({ id: uid('t'), name: g.name, color: THEME_PALETTE[i % THEME_PALETTE.length] }));
    m.assign = {};
    groups.forEach((g, i) => g.members.forEach(id => { m.assign[id] = m.themes[i].id; }));
    m.pos = {};
    m.seen = evs.map(e => e.id);
    m.autoDone = true;
    touchProject(); logActivity('waypoints', 'act.grouped', { n: m.themes.length }); commit();
    drawMap();
    toast(t('map.grouped', { n: m.themes.length }), { icon: 'sparkles' });
  }

  /* Newly saved evidence goes to its closest existing theme (if clearly related) */
  function placeNewEvidence(p, evs) {
    const m = mapFor(p.id);
    const fresh = evs.filter(e => !m.seen.includes(e.id));
    if (!fresh.length) return;
    if (m.themes.length) {
      const { vecs } = buildVectors(evs, p);
      const idx = Object.fromEntries(evs.map((e, i) => [e.id, i]));
      fresh.forEach(e => {
        let best = null, bestSim = 0.06;
        m.themes.forEach(th => {
          const members = evs.filter(x => m.assign[x.id] === th.id);
          if (!members.length) return;
          const s = members.reduce((acc, x) => acc + cosine(vecs[idx[e.id]], vecs[idx[x.id]]), 0) / members.length;
          if (s > bestSim) { bestSim = s; best = th.id; }
        });
        if (best) m.assign[e.id] = best;
      });
    }
    m.seen = [...new Set(m.seen.concat(fresh.map(e => e.id)))];
    persist();
  }

  /* Suggested similarity links (not stored; dismissible) */
  function autoLinks(evs, p) {
    const m = mapFor(p.id);
    if (evs.length < 2) return [];
    const { vecs, word } = buildVectors(evs, p);
    const pairs = [];
    for (let i = 0; i < evs.length; i++) for (let j = i + 1; j < evs.length; j++) {
      const s = cosine(vecs[i], vecs[j]);
      if (s >= 0.18) pairs.push({ a: evs[i].id, b: evs[j].id, s, terms: sharedTerms(vecs[i], vecs[j], word) });
    }
    const degree = {};
    const key = (a, b) => [a, b].sort().join('|');
    const manual = new Set(m.links.map(l => key(l.a, l.b)));
    return pairs.sort((x, y) => y.s - x.s).filter(pr => {
      if (manual.has(key(pr.a, pr.b)) || m.dismissed.includes(key(pr.a, pr.b))) return false;
      if ((degree[pr.a] || 0) >= 3 || (degree[pr.b] || 0) >= 3) return false;
      degree[pr.a] = (degree[pr.a] || 0) + 1; degree[pr.b] = (degree[pr.b] || 0) + 1;
      return true;
    }).map(pr => ({ id: 'auto:' + key(pr.a, pr.b), a: pr.a, b: pr.b, type: 'similar', auto: true, score: pr.s, terms: pr.terms }));
  }

  /* Default positions: one column per theme (theme on top, its quotes stacked underneath),
     plus a "No theme" column. The canvas grows taller when a column gets long. */
  function layout(p, evs) {
    const m = mapFor(p.id);
    const pos = {};
    const loose = evs.filter(e => !m.assign[e.id] || !m.themes.some(th => th.id === m.assign[e.id]));
    const columns = m.themes.map(th => ({ key: 't:' + th.id, members: evs.filter(e => m.assign[e.id] === th.id) }));
    if (loose.length) columns.push({ key: null, members: loose });
    const colW = MAP_W / Math.max(1, columns.length);
    const ROW = 145, TOP = 70, FIRST = 190;
    let maxRows = 1;
    columns.forEach((col, ci) => {
      const cx = colW * ci + colW / 2;
      if (col.key) pos[col.key] = [cx, TOP];
      const sub = colW >= 420 ? 2 : 1;
      col.members.forEach((e, j) => {
        const row = Math.floor(j / sub);
        const x = sub === 1 ? cx : cx + (j % sub === 0 ? -1 : 1) * colW / 4.4;
        pos['e:' + e.id] = [x, FIRST + row * ROW];
        maxRows = Math.max(maxRows, row + 1);
      });
    });
    const H = Math.max(MAP_H, FIRST + maxRows * ROW);
    Object.keys(pos).forEach(key => {
      if (m.pos[key]) pos[key] = m.pos[key];
      pos[key] = [Math.min(MAP_W - 100, Math.max(100, pos[key][0])), Math.min(H - 60, Math.max(50, pos[key][1]))];
    });
    return { pos, H, columns: columns.length };
  }

  function currentEdges(p, evs) {
    const m = mapFor(p.id);
    const ids = new Set(evs.map(e => e.id));
    const edges = [];
    evs.forEach(e => { const th = themeOf(e); if (th) edges.push({ from: 't:' + th.id, to: 'e:' + e.id, type: 'theme' }); });
    m.links.filter(l => ids.has(l.a) && ids.has(l.b)).forEach(l => edges.push({ from: 'e:' + l.a, to: 'e:' + l.b, type: l.type, link: l }));
    autoLinks(evs, p).forEach(l => edges.push({ from: 'e:' + l.a, to: 'e:' + l.b, type: 'similar', link: l, auto: true }));
    return edges;
  }

  function renderMap() {
    const p = currentProject();
    const evs = projectEvidence(p.id);
    if (!evs.length) {
      $('#page-map').innerHTML = `
        <div class="page-header"><div><h1>${t('nav.map')}</h1><p>${t('map.sub')}</p></div></div>
        <div class="empty empty-project">
          <div class="empty-icon"><i data-lucide="waypoints"></i></div>
          <h3>${t('map.emptyT')}</h3>
          <p>${t('map.emptyS')}</p>
          <button class="btn btn-primary btn-sm" data-action="go" data-page="evidence"><i data-lucide="library"></i>${t('b.goLib')}</button>
        </div>`;
      return;
    }
    const m = mapFor(p.id);
    if (!m.themes.length && !m.autoDone && evs.length >= 2) {
      // First visit: suggest themes automatically
      const groups = suggestThemes(evs, p);
      m.themes = groups.map((g, i) => ({ id: uid('t'), name: g.name, color: THEME_PALETTE[i % THEME_PALETTE.length] }));
      groups.forEach((g, i) => g.members.forEach(id => { m.assign[id] = m.themes[i].id; }));
      m.seen = evs.map(e => e.id);
      m.autoDone = true;
      persist();
    } else {
      placeNewEvidence(p, evs);
    }
    const f = ui.mapFilters;
    $('#page-map').innerHTML = `
      <div class="page-header">
        <div><h1>${t('nav.map')}</h1><p>${t('map.sub')}</p></div>
        <div class="actions">
          <button class="btn btn-outline btn-sm" data-action="map-add-theme"><i data-lucide="plus"></i>${t('map.addTheme')}</button>
          <button class="btn btn-outline btn-sm" data-action="map-auto"><i data-lucide="sparkles"></i>${t('map.regroup')}</button>
          <button class="btn btn-ghost btn-sm" data-action="map-reset-layout"><i data-lucide="layout-grid"></i>${t('map.tidy')}</button>
        </div>
      </div>
      <div class="map-layout">
        <section class="panel map-wrap">
          <div class="map-toolbar">
            <div class="legend">
              ${legendItem('theme', t('map.theme'), f.theme)}
              ${legendItem('similar', t('conn.similar'), f.similar)}
              ${legendItem('different', t('conn.different'), f.different)}
              ${legendItem('contradicts', t('conn.contradicts'), f.contradicts)}
            </div>
            <span class="result-meta" id="mapMeta"></span>
          </div>
          <div class="map-linking" id="mapLinking" hidden></div>
          <div class="map-scroll"><div class="map-canvas" id="mapCanvas"></div></div>
        </section>
        <aside class="panel map-detail" id="mapDetail"></aside>
      </div>`;
    drawMap();
  }
  function legendItem(type, label, checked) {
    return `<label class="legend-item"><input type="checkbox" data-conn-filter="${type}" ${checked ? 'checked' : ''}/><span class="legend-line ${type}"></span>${label}</label>`;
  }

  function drawMap() {
    const canvas = $('#mapCanvas');
    if (!canvas) return;
    const p = currentProject();
    const m = mapFor(p.id);
    const evs = projectEvidence(p.id);
    const { pos, H, columns } = layout(p, evs);
    ui.mapH = H;
    canvas.style.aspectRatio = `${MAP_W} / ${H}`;
    canvas.style.minWidth = Math.max(740, columns * 190) + 'px';
    const sel = ui.mapSelected;
    const edges = currentEdges(p, evs).filter(e => ui.mapFilters[e.type]);
    const related = new Set();
    const relatedEdges = new Set();
    if (sel) {
      related.add(sel);
      edges.forEach((e, i) => { if (e.from === sel || e.to === sel) { related.add(e.from); related.add(e.to); relatedEdges.add(i); } });
    }
    const lines = edges.map((e, i) => {
      const [x1, y1] = pos[e.from] || [0, 0]; const [x2, y2] = pos[e.to] || [0, 0];
      return `<line class="conn ${e.type} ${e.auto ? 'auto' : ''} ${relatedEdges.has(i) ? 'related' : ''}" data-from="${e.from}" data-to="${e.to}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
    }).join('');
    const nodeStyle = (key, color) => { const [x, y] = pos[key]; return `left:${x / MAP_W * 100}%;top:${y / H * 100}%;--c:${color}`; };
    const themeNodes = m.themes.map(th => {
      const key = 't:' + th.id;
      const n = evs.filter(e => m.assign[e.id] === th.id).length;
      return `<button class="map-node theme-node ${sel === key ? 'selected' : ''} ${related.has(key) ? 'related' : ''}" style="${nodeStyle(key, th.color)}" data-action="select-node" data-id="${key}">
        <span class="dot"></span>${esc(th.name)}<span class="n">${n}</span></button>`;
    }).join('');
    const evNodes = evs.map(e => {
      const key = 'e:' + e.id;
      const src = sourceOf(e);
      const th = themeOf(e);
      return `<button class="map-node ev-node ${sel === key ? 'selected' : ''} ${related.has(key) ? 'related' : ''} ${ui.linkFrom === e.id ? 'link-source' : ''}" style="${nodeStyle(key, th ? th.color : 'var(--border-strong)')}" data-action="select-node" data-id="${key}" title="${esc(e.title)}">
        <span class="ev-node-src">${esc(inText(src, e.page, state.user.citation, sourceNumber(src)).replace(/^\(|\)$/g, ''))}</span>
        <span class="ev-node-title">${esc(e.title)}</span></button>`;
    }).join('');
    canvas.classList.toggle('has-selection', !!sel && !ui.linkFrom);
    canvas.classList.toggle('linking', !!ui.linkFrom);
    canvas.innerHTML = `<svg class="map-lines" viewBox="0 0 ${MAP_W} ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${themeNodes}${evNodes}`;
    const userLinks = m.links.length;
    const meta = $('#mapMeta');
    if (meta) meta.textContent = t('map.meta', { a: m.themes.length, b: evs.length, c: userLinks });
    const banner = $('#mapLinking');
    if (banner) {
      banner.hidden = !ui.linkFrom;
      if (ui.linkFrom) banner.innerHTML = `<i data-lucide="link-2"></i><span>${t('map.pickTarget')}</span><button class="btn btn-ghost btn-sm" data-action="map-cancel-link">${t('common.cancel')}</button>`;
    }
    renderMapDetail();
    icons();
  }

  function connBadge(type, auto) {
    return `<span class="conn-badge ${type}"><i data-lucide="${CONN_ICONS[type]}"></i>${t('conn.' + type)}${auto ? ` · ${t('map.suggested')}` : ''}</span>`;
  }

  function renderMapDetail() {
    const panel = $('#mapDetail');
    if (!panel) return;
    const p = currentProject();
    const m = mapFor(p.id);
    const evs = projectEvidence(p.id);
    const sel = ui.mapSelected;
    const closeBtn = `<button class="icon-btn sm" data-action="clear-selection" aria-label="${t('map.closeDetail')}"><i data-lucide="x"></i></button>`;

    // Link form after picking two cards
    if (ui.linkDraft) {
      const a = evidenceById(ui.linkDraft.a), b = evidenceById(ui.linkDraft.b);
      panel.innerHTML = `
        <div class="panel-head"><h3>${t('map.newLink')}</h3>${closeBtn}</div>
        <form class="detail-section" id="linkForm">
          <div class="link-pair"><strong>${esc(a.title)}</strong><span>↔</span><strong>${esc(b.title)}</strong></div>
          <div class="field"><label>${t('map.linkType')}</label>
            <div class="type-pick">
              ${['similar', 'different', 'contradicts'].map((tp, i) => `<label class="type-opt ${tp}"><input type="radio" name="type" value="${tp}" ${i === (ui.linkDraft.type === 'similar' ? 0 : ui.linkDraft.type === 'different' ? 1 : 2) ? 'checked' : ''}/><i data-lucide="${CONN_ICONS[tp]}"></i>${t('conn.' + tp)}</label>`).join('')}
            </div></div>
          <div class="field"><label>${t('map.linkNote')}</label><textarea name="note" rows="3" placeholder="${t('map.linkNotePh')}">${esc(ui.linkDraft.note || '')}</textarea></div>
          <div class="form-actions"><button type="button" class="btn btn-ghost btn-sm" data-action="map-cancel-link">${t('common.cancel')}</button><button type="submit" class="btn btn-primary btn-sm"><i data-lucide="check"></i>${t('map.saveLink')}</button></div>
        </form>`;
      icons();
      return;
    }

    if (!sel) {
      const contra = m.links.filter(l => l.type === 'contradicts');
      panel.innerHTML = `
        <div class="panel-head"><h3>${t('map.overview')}</h3></div>
        <div class="map-hint"><i data-lucide="mouse-pointer-click"></i><span>${t('map.hint')}</span></div>
        <div class="detail-section">
          <div class="overview-stats">
            <div><strong>${m.themes.length}</strong><span>${t('map.themes')}</span></div>
            <div><strong>${evs.length}</strong><span>${t('map.evNodes')}</span></div>
            <div><strong>${m.links.length}</strong><span>${t('map.yourLinks')}</span></div>
            <div><strong style="color:var(--red)">${contra.length}</strong><span>${t('map.contras')}</span></div>
          </div>
        </div>
        </div>
        ${contra.length ? `<div class="detail-section"><h4>${t('map.tensions')}</h4><ul class="detail-list">
          ${contra.map(l => `<li><button class="detail-link" data-action="select-node" data-id="e:${l.a}">${connBadge('contradicts')}<strong>${esc(evidenceById(l.a)?.title || '')} ↔ ${esc(evidenceById(l.b)?.title || '')}</strong>${l.note ? `<small>${esc(l.note)}</small>` : ''}</button></li>`).join('')}
        </ul></div>` : ''}`;
      icons();
      return;
    }

    const [kind, id] = sel.split(':');
    if (kind === 't') {
      const th = m.themes.find(x => x.id === id);
      if (!th) { ui.mapSelected = null; renderMapDetail(); return; }
      const members = evs.filter(e => m.assign[e.id] === id);
      panel.innerHTML = `
        <div class="panel-head"><span class="detail-kind"><span class="dot" style="--c:${th.color}"></span>${t('map.kindTheme')}</span>${closeBtn}</div>
        <div class="detail-section">
          <div class="field"><label for="themeName">${t('map.themeName')}</label><input id="themeName" data-theme-id="${th.id}" value="${esc(th.name)}" /></div>
          <div class="swatches">${THEME_PALETTE.map(c => `<button class="swatch ${c === th.color ? 'on' : ''}" style="--c:${c}" data-action="map-theme-color" data-id="${th.id}" data-color="${c}" aria-label="${c}"></button>`).join('')}</div>
        </div>
        <div class="detail-section">
          <h4>${t('map.inTheme', { n: members.length })}</h4>
          ${members.length ? `<ul class="detail-list">${members.map(e => `<li><button class="detail-link" data-action="select-node" data-id="e:${e.id}"><strong>${esc(e.title)}</strong><small>${esc(shortCite(e))}</small></button></li>`).join('')}</ul>` : `<p class="detail-desc">${t('map.themeEmpty')}</p>`}
          <div class="detail-actions">
            <button class="btn btn-soft btn-sm" data-action="library-theme" data-theme="${th.id}"><i data-lucide="library"></i>${t('map.openLib')}</button>
            <button class="btn btn-danger btn-sm" data-action="map-delete-theme" data-id="${th.id}"><i data-lucide="trash-2"></i>${t('map.deleteTheme')}</button>
          </div>
        </div>`;
    } else {
      const e = evidenceById(id);
      if (!e) { ui.mapSelected = null; renderMapDetail(); return; }
      const src = sourceOf(e);
      const th = themeOf(e);
      const links = m.links.filter(l => l.a === id || l.b === id).map(l => ({ ...l }));
      const autos = autoLinks(evs, p).filter(l => l.a === id || l.b === id);
      panel.innerHTML = `
        <div class="panel-head"><span class="detail-kind"><span class="dot" style="--c:${th ? th.color : 'var(--border-strong)'}"></span>${t('map.kindEv')}</span>${closeBtn}</div>
        <div class="detail-section">
          <h3 class="detail-title">${esc(e.title)}</h3>
          <blockquote class="ev-excerpt"><span class="label-src"><i data-lucide="quote"></i>${t('ev.excerpt')}</span><p>“${esc(e.excerpt)}”</p></blockquote>
          <div class="ev-foot" style="margin-top:12px">
            <span class="ev-src"><i data-lucide="file-text"></i><span>${esc(src.file)}</span></span>
            <span class="page-pill">${t('common.page', { n: e.page })}</span>
            <span class="ev-cite">${inText(src, e.page, state.user.citation, sourceNumber(src), true)}</span>
          </div>
          <div class="field" style="margin-top:14px"><label for="evTheme">${t('map.kindTheme')}</label>
            <select id="evTheme" data-ev-theme="${e.id}">
              <option value="">${t('map.unsorted')}</option>
              ${m.themes.map(x => `<option value="${x.id}" ${th && th.id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
            </select></div>
          <button class="btn btn-primary btn-sm" data-action="map-start-link" data-id="${e.id}"><i data-lucide="link-2"></i>${t('map.connect')}</button>
        </div>
        <div class="detail-section">
          <h4>${t('map.conns', { n: links.length + autos.length })}</h4>
          ${links.length || autos.length ? `<ul class="detail-list">
            ${links.map(l => { const other = evidenceById(l.a === id ? l.b : l.a); return `<li class="link-item">
              <button class="detail-link" data-action="select-node" data-id="e:${other.id}">${connBadge(l.type)}<strong>${esc(other.title)}</strong>${l.note ? `<small>${esc(l.note)}</small>` : ''}</button>
              <button class="icon-btn sm danger" data-action="map-delete-link" data-id="${l.id}" aria-label="${t('map.deleteLink')}"><i data-lucide="trash-2"></i></button></li>`; }).join('')}
            ${autos.map(l => { const other = evidenceById(l.a === id ? l.b : l.a); return `<li class="link-item">
              <button class="detail-link" data-action="select-node" data-id="e:${other.id}">${connBadge('similar', true)}<strong>${esc(other.title)}</strong><small>${t('map.sharedTerms', { w: l.terms.join(', ') })}</small></button>
              <span class="link-tools">
                <button class="icon-btn sm" data-action="map-keep-link" data-a="${l.a}" data-b="${l.b}" title="${t('map.keep')}" aria-label="${t('map.keep')}"><i data-lucide="check"></i></button>
                <button class="icon-btn sm" data-action="map-dismiss-link" data-a="${l.a}" data-b="${l.b}" title="${t('map.dismiss')}" aria-label="${t('map.dismiss')}"><i data-lucide="x"></i></button>
              </span></li>`; }).join('')}
          </ul>` : `<p class="detail-desc">${t('map.noConns')}</p>`}
        </div>`;
    }
    icons();
  }

  /* Dragging nodes (pointer events), a short press without movement still counts as a click */
  let mapDrag = null;
  document.addEventListener('pointerdown', (e) => {
    const node = e.target.closest('#mapCanvas .map-node');
    if (!node || e.button !== 0) return;
    const canvas = $('#mapCanvas');
    mapDrag = { node, key: node.dataset.id, x0: e.clientX, y0: e.clientY, moved: false, rect: canvas.getBoundingClientRect() };
  });
  document.addEventListener('pointermove', (e) => {
    if (!mapDrag) return;
    if (!mapDrag.moved && Math.hypot(e.clientX - mapDrag.x0, e.clientY - mapDrag.y0) < 5) return;
    mapDrag.moved = true;
    mapDrag.node.classList.add('dragging');
    const r = mapDrag.rect;
    const x = Math.min(MAP_W - 100, Math.max(100, (e.clientX - r.left) / r.width * MAP_W));
    const H = ui.mapH || MAP_H;
    const y = Math.min(H - 30, Math.max(30, (e.clientY - r.top) / r.height * H));
    mapDrag.pos = [x, y];
    mapDrag.node.style.left = (x / MAP_W * 100) + '%';
    mapDrag.node.style.top = (y / H * 100) + '%';
    $$(`#mapCanvas line[data-from="${mapDrag.key}"]`).forEach(l => { l.setAttribute('x1', x); l.setAttribute('y1', y); });
    $$(`#mapCanvas line[data-to="${mapDrag.key}"]`).forEach(l => { l.setAttribute('x2', x); l.setAttribute('y2', y); });
  });
  document.addEventListener('pointerup', () => {
    if (!mapDrag) return;
    if (mapDrag.moved && mapDrag.pos) {
      mapFor().pos[mapDrag.key] = mapDrag.pos.map(Math.round);
      persist();
      ui.suppressClick = true;
      setTimeout(() => { ui.suppressClick = false; }, 0);
    }
    mapDrag.node.classList.remove('dragging');
    mapDrag = null;
  });
  /* ---------- Argument Builder ---------- */
  function renderBuilder() {
    const p = currentProject();
    const o = outlineFor(p.id);
    const saved = savedList().map(evidenceById).filter(Boolean);
    const usage = {};
    o.args.forEach(a => a.evidence.forEach(id => { usage[id] = (usage[id] || 0) + 1; }));
    const unsupported = o.args.filter(a => !a.evidence.length && L(a.claim));
    const hasCounter = o.args.some(a => a.type === 'counter');
    const checks = [
      { ok: !!L(o.thesis), text: t(L(o.thesis) ? 'b.ckThesis' : 'b.ckThesisW') },
      { ok: o.args.length >= 2, text: t('b.ckSections', { n: o.args.length }) },
      { ok: !unsupported.length, text: unsupported.length ? t('b.ckNoEv', { n: unsupported.length }) : t('b.ckAllEv') },
      { ok: hasCounter, text: t(hasCounter ? 'b.ckCounter' : 'b.ckCounterW') }
    ];

    $('#page-builder').innerHTML = `
      <div class="page-header">
        <div><h1>${t('nav.builder')}</h1><p>${t('b.sub')}</p></div>
        <div class="actions">
          <button class="btn btn-outline" data-action="open-refs-used"><i data-lucide="book-marked"></i>${t('b.refs')}</button>
          <button class="btn btn-outline" data-action="export-outline"><i data-lucide="copy"></i>${t('b.copy')}</button>
          <button class="btn btn-primary" data-action="add-arg"><i data-lucide="plus"></i>${t('b.add')}</button>
        </div>
      </div>

      <div class="builder-layout">
        <div class="outline">
          ${thesisCard(o)}
          <div class="arg-list" id="argList">
            ${o.args.map((a, i) => ui.editingArg === a.id ? argForm(a, i) : argCard(a, i, o.args.length)).join('')}
          </div>
          ${!o.args.length ? `<div class="empty"><div class="empty-icon"><i data-lucide="list-tree"></i></div><h3>${t('b.noSections')}</h3><p>${t('b.noSectionsSub')}</p></div>` : ''}
          <button class="add-section" data-action="add-arg"><i data-lucide="plus"></i>${t('b.addLong')}</button>
        </div>

        <aside class="panel tray">
          <div class="panel-head"><h3>${t('b.saved')}</h3><span class="count-pill">${saved.length}</span></div>
          <div class="outline-check">
            <strong>${t('b.check')}</strong>
            <ul>${checks.map(c => `<li class="${c.ok ? 'ok' : 'warn'}"><i data-lucide="${c.ok ? 'circle-check' : 'circle-alert'}"></i><span>${c.text}</span></li>`).join('')}</ul>
          </div>
          <div class="tray-list">
            ${saved.length ? saved.map(e => `
              <div class="tray-item" draggable="true" data-drag-evidence="${e.id}" title="${t('b.dragHint')}">
                <i data-lucide="grip-vertical"></i>
                <div><strong>${esc(L(e.title))}</strong><small>${esc(shortCite(e))}${usage[e.id] ? `<span class="used-pill">${t('b.used', { n: usage[e.id] })}</span>` : ''}</small></div>
              </div>`).join('')
              : `<div class="empty" style="padding:24px 16px"><p style="margin-bottom:10px">${t('b.trayEmpty')}</p><button class="btn btn-soft btn-sm" data-action="go" data-page="evidence">${t('b.goLib')}</button></div>`}
          </div>
        </aside>
      </div>`;

    if (ui.editingArg) { const input = $(`#argForm-${ui.editingArg} input[name="claim"]`); if (input) input.focus(); }
  }

  function thesisCard(o) {
    const p = currentProject();
    const thesis = L(o.thesis);
    if (ui.editingThesis) {
      return `
        <form class="thesis-card" id="thesisForm">
          <div class="thesis-top"><span class="thesis-label"><i data-lucide="target"></i>${t('b.thesis')}</span></div>
          <div class="field"><textarea name="thesis" rows="3" class="input" placeholder="${t('b.thesisPh')}">${esc(thesis)}</textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-action="cancel-thesis">${t('common.cancel')}</button>
            <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="check"></i>${t('b.saveThesis')}</button>
          </div>
        </form>`;
    }
    return `
      <section class="thesis-card">
        <div class="thesis-top">
          <span class="thesis-label"><i data-lucide="target"></i>${t('b.thesis')}</span>
          <button class="btn btn-ghost btn-sm" data-action="edit-thesis"><i data-lucide="pencil"></i>${t('common.edit')}</button>
        </div>
        <p class="thesis-text ${thesis ? '' : 'placeholder'}">${thesis ? esc(thesis) : esc(t('b.thesisEmpty', { q: L(p.question) || '-' }))}</p>
      </section>`;
  }

  function argCard(a, i, total) {
    const linkable = savedList().filter(id => !a.evidence.includes(id)).map(evidenceById).filter(Boolean);
    return `
      <article class="arg-card" data-id="${a.id}">
        <div class="arg-handle" title="Drag" aria-hidden="true"><i data-lucide="grip-vertical"></i></div>
        <div class="arg-body">
          <div class="arg-top">
            <span class="arg-num">${t('b.section', { n: i + 1 })}</span>
            <span class="arg-type ${a.type}">${t('type.' + a.type)}</span>
            <div class="arg-actions">
              <button class="icon-btn sm" data-action="move-arg" data-id="${a.id}" data-dir="-1" aria-label="${t('b.moveUp')}" ${i === 0 ? 'disabled' : ''}><i data-lucide="arrow-up"></i></button>
              <button class="icon-btn sm" data-action="move-arg" data-id="${a.id}" data-dir="1" aria-label="${t('b.moveDown')}" ${i === total - 1 ? 'disabled' : ''}><i data-lucide="arrow-down"></i></button>
              <button class="icon-btn sm" data-action="edit-arg" data-id="${a.id}" aria-label="${t('b.editSec')}"><i data-lucide="pencil"></i></button>
              <button class="icon-btn sm danger" data-action="delete-arg" data-id="${a.id}" aria-label="${t('b.delSec')}"><i data-lucide="trash-2"></i></button>
            </div>
          </div>
          <h3 class="arg-claim">${esc(L(a.claim))}</h3>
          ${L(a.explanation) ? `<p class="arg-expl">${esc(L(a.explanation))}</p>` : ''}
          <div class="arg-evidence">
            <div class="arg-evidence-label"><i data-lucide="link-2"></i>${t('b.linked', { n: a.evidence.length })}</div>
            <div class="ev-links">
              ${a.evidence.length ? a.evidence.map(id => {
                const e = evidenceById(id); if (!e) return '';
                return `<div class="ev-link">
                  <span class="dot" style="--c:${themeColor(e)}"></span>
                  <div class="ev-link-text"><strong>${esc(L(e.title))}</strong><small>${esc(shortCite(e))}${isSaved(id) ? '' : ' · ' + t('b.notSaved')}</small></div>
                  <button class="icon-btn sm" data-action="unlink-evidence" data-arg="${a.id}" data-id="${id}" aria-label="${t('b.unlink')}"><i data-lucide="x"></i></button>
                </div>`;
              }).join('') : `<div class="ev-link-warn"><i data-lucide="circle-alert"></i>${t('b.noEv')}</div>`}
            </div>
            <div class="link-row">
              ${linkable.length ? `<select class="select" data-link-select="${a.id}" aria-label="${t('b.linkSel')}">
                <option value="">${t('b.linkSel')}</option>
                ${linkable.map(e => `<option value="${e.id}">${esc(L(e.title))}</option>`).join('')}
              </select>` : ''}
              <span class="drop-hint">${t('b.orDrag')}</span>
            </div>
          </div>
        </div>
      </article>`;
  }

  function argForm(a, i) {
    return `
      <form class="arg-card arg-form" id="argForm-${a.id}" data-id="${a.id}">
        <div class="arg-handle" aria-hidden="true"><i data-lucide="pencil"></i></div>
        <div class="arg-body">
          <div class="arg-top"><span class="arg-num">${t('b.editing', { n: i + 1 })}</span></div>
          <div class="field-row">
            <div class="field">
              <label>${t('b.type')}</label>
              <select name="type">${['supporting', 'counter', 'rebuttal'].map(k => `<option value="${k}" ${a.type === k ? 'selected' : ''}>${t('type.' + k)}</option>`).join('')}</select>
            </div>
            <div></div>
          </div>
          <div class="field"><label>${t('b.claim')} <span class="req">*</span></label><input name="claim" value="${esc(L(a.claim))}" placeholder="${t('b.claimPh')}" required /></div>
          <div class="field"><label>${t('b.reason')}</label><textarea name="explanation" rows="3" placeholder="${t('b.reasonPh')}">${esc(L(a.explanation))}</textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-action="cancel-arg" data-id="${a.id}">${t('common.cancel')}</button>
            <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="check"></i>${t('b.saveSec')}</button>
          </div>
        </div>
      </form>`;
  }

  function linkEvidence(argId, evId) {
    const a = outlineFor().args.find(x => x.id === argId);
    if (!a || !evId) return;
    if (a.evidence.includes(evId)) { toast(t('b.already'), { icon: 'info', type: 'warn' }); return; }
    a.evidence.push(evId);
    touchProject();
    logActivity('link-2', 'act.linked', { e: evidenceById(evId).title, a: truncate(L(a.claim), 40) });
    commit();
    refresh();
    toast(t('b.linkedToast'), { icon: 'link-2' });
  }

  function usedSourceIds() {
    const ids = new Set();
    outlineFor().args.forEach(a => a.evidence.forEach(id => { const e = evidenceById(id); if (e) ids.add(e.sourceId); }));
    return [...ids];
  }

  function exportOutline() {
    const p = currentProject();
    const o = outlineFor();
    const style = state.user.citation;
    let txt = `${L(p.title)}\n${t('b.exportQ')}: ${L(p.question) || '-'}\n\n${t('b.exportThesis')}\n${L(o.thesis) || '-'}\n`;
    o.args.forEach((a, i) => {
      txt += `\n${i + 1}. [${t('type.' + a.type)}] ${L(a.claim)}\n`;
      if (L(a.explanation)) txt += `   ${L(a.explanation)}\n`;
      a.evidence.forEach(id => { const e = evidenceById(id); if (e) txt += `   - ${L(e.title)} ${shortCite(e)}\n`; });
    });
    const srcs = usedSourceIds().map(id => p.sources.find(s => s.id === id)).filter(Boolean);
    if (srcs.length) {
      txt += `\n${t('b.exportRefs')} (${CITATION_STYLES[style].label})\n`;
      referenceList(srcs, style).forEach(r => { txt += stripTags(r.html) + '\n'; });
    }
    copyText(txt, () => toast(t('b.copied', { s: CITATION_STYLES[style].label }), { icon: 'clipboard-check' }));
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    const u = state.user;
    $('#page-settings').innerHTML = `
      <div class="page-header"><div><h1>${t('nav.settings')}</h1><p>${t('set.sub')}</p></div></div>
      <div class="settings-grid">
        <form class="panel" id="settingsForm">
          <div class="panel-head"><h2>${t('set.profile')}</h2></div>
          <div class="panel-body">
            <div class="field"><label for="setName">${t('set.name')}</label><input id="setName" name="name" value="${esc(u.name)}" required /></div>
            <div class="field"><label for="setUni">${t('set.uni')}</label><input id="setUni" name="university" value="${esc(u.university)}" /></div>
            <div class="field"><label for="setProg">${t('set.program')}</label><input id="setProg" name="program" value="${esc(u.program || '')}" /></div>
          </div>
          <div class="panel-head" style="padding-top:4px"><h2>${t('set.prefs')}</h2></div>
          <div class="panel-body">
            <div class="field">
              <label for="setLang">${t('set.lang')}</label>
              <select id="setLang" name="lang"><option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option><option value="vi" ${state.lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option></select>
              <small class="hint">${t('set.langNote')}</small>
            </div>
            <div class="field">
              <label for="setCite">${t('set.cite')}</label>
              <select id="setCite" name="citation">${Object.entries(CITATION_STYLES).map(([k, v]) => `<option value="${k}" ${u.citation === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
              <small class="hint cite-preview" id="citePreview"></small>
            </div>
            <div class="form-actions" style="margin-top:12px"><button class="btn btn-primary" type="submit"><i data-lucide="check"></i>${t('set.save')}</button></div>
          </div>
        </form>

        <div style="display:flex;flex-direction:column;gap:20px">
          <section class="panel">
            <div class="panel-head"><h2>${t('set.help')}</h2></div>
            <div class="panel-body about">
              <p>${t('set.helpSub')}</p>
              <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-soft" data-action="start-tour"><i data-lucide="compass"></i>${t('set.replay')}</button>
                <a class="btn btn-outline" href="#home"><i data-lucide="info"></i>${t('set.viewIntro')}</a>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>${t('set.data')}</h2></div>
            <div class="panel-body about">
              <p>${t('set.dataSub')}</p>
              <div style="margin-top:14px"><button class="btn btn-danger" data-action="reset-demo"><i data-lucide="trash-2"></i>${t('set.reset')}</button></div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>${t('set.about')}</h2></div>
            <div class="panel-body about">
              <p><strong>${t('l.h1a')} ${t('l.h1b')}</strong></p>
              <p>${t('set.about1')}</p>
              <p>${t('set.about2')}</p>
            </div>
          </section>
        </div>
      </div>`;
    updateCitePreview(u.citation);
  }
  function updateCitePreview(style) {
    const el = $('#citePreview');
    if (!el) return;
    const s = EXAMPLE_SOURCE;
    el.innerHTML = `${t('ref.inText')}: <code>${esc(inText(s, 9, style, 1))}</code>`;
  }

  /* ---------- Create project modal ---------- */
  function openModal() {
    ui.pendingFiles = [];
    const form = $('#projectForm');
    form.reset();
    $('#pfTitleError').hidden = true;
    $('#pfTitle').closest('.field').classList.remove('invalid');
    renderPendingFiles();
    $('#projectModal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#pfTitle').focus(), 30);
  }
  function closeModal() { $('#projectModal').hidden = true; document.body.style.overflow = ''; }
  function pdfsOnly(fileList) {
    const files = [...fileList];
    const pdfs = files.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (pdfs.length < files.length) toast(t('lib.skipped', { n: files.length - pdfs.length }), { icon: 'triangle-alert', type: 'warn' });
    return pdfs;
  }
  function addPendingFiles(fileList) {
    pdfsOnly(fileList).forEach(f => {
      if (!ui.pendingFiles.some(x => x.name === f.name && x.size === f.size)) ui.pendingFiles.push({ name: f.name, size: f.size, file: f });
    });
    renderPendingFiles();
  }
  function renderPendingFiles() {
    $('#projectFileList').innerHTML = ui.pendingFiles.map((f, i) => `
      <li><i data-lucide="file-text"></i><span title="${esc(f.name)}">${esc(f.name)}</span><small>${formatSize(f.size)}</small>
      <button type="button" class="icon-btn sm" data-action="remove-file" data-index="${i}" aria-label="${esc(t('modal.remove', { t: f.name }))}"><i data-lucide="x"></i></button></li>`).join('');
    icons();
  }
  function newSource(f) { return { id: uid('s'), file: f.name, title: fileToTitle(f.name), pages: null, size: formatSize(f.size), status: 'reading', progress: 0 }; }

  function createProject(form) {
    const data = Object.fromEntries(new FormData(form));
    const title = (data.title || '').trim();
    if (!title) {
      $('#pfTitleError').hidden = false;
      $('#pfTitle').closest('.field').classList.add('invalid');
      $('#pfTitle').focus();
      return;
    }
    const now = Date.now();
    const project = {
      id: uid('p'), title, course: (data.course || '').trim().toUpperCase(),
      question: (data.question || '').trim(), description: (data.description || '').trim(), due: data.due || '',
      sources: ui.pendingFiles.map(newSource), sampleEvidence: 0, updated: now, created: now
    };
    state.projects.unshift(project);
    state.currentProjectId = project.id;
    state.saved[project.id] = [];
    state.outlines[project.id] = { thesis: '', args: [] };
    logActivity('folder-plus', 'act.created', { t: title }, project.id);
    const files = ui.pendingFiles.map(f => f.file);
    project.sources.forEach((s, i) => { if (files[i]) queueRead(project.id, s, files[i]); });
    resetLibraryFilters();
    commit();
    closeModal();
    toast(t('modal.created', { t: title }), { icon: 'folder-check' });
    navigate(files.length ? 'evidence' : 'dashboard');
  }

  function addSourcesToCurrent(fileList) {
    const p = currentProject();
    const pdfs = pdfsOnly(fileList);
    if (!pdfs.length) return;
    pdfs.forEach(f => {
      const existing = p.sources.find(s => s.file === f.name && s.status !== 'reading');
      const src = existing || newSource(f);
      if (!existing) p.sources.push(src);
      queueRead(p.id, src, f);
    });
    if (pdfs.length === 1) logActivity('file-up', 'act.uploaded', { f: pdfs[0].name });
    else logActivity('file-up', 'act.uploadedN', { n: pdfs.length });
    touchProject();
    commit();
    refresh();
    toast(t('lib.pdfAdded', { n: pdfs.length, t: L(p.title) }), { icon: 'file-check' });
  }

  function resetLibraryFilters() {
    ui.lib = { query: '', theme: 'all', source: 'all', tab: 'all' };
    ui.answer = null;
    ui.mapSelected = null;
    ui.editingArg = null;
    ui.editingThesis = false;
  }
  function switchProject(id) {
    if (!state.projects.some(p => p.id === id)) return;
    state.currentProjectId = id;
    resetLibraryFilters();
    commit();
  }

  /* ------------------------------------------------------
     9. ONBOARDING TOUR: spotlight + popover, skippable
     ------------------------------------------------------ */
  const TOUR = [
    { center: true },
    { page: 'dashboard', sel: '.sidebar .nav', sidebar: true },
    { page: 'dashboard', sel: '.sidebar [data-tour="new-project"]', sidebar: true },
    { page: 'dashboard', sel: '.workflow, .empty-project' },
    { page: 'evidence', sel: '.ask-card, .empty-project' },
    { page: 'evidence', sel: '#evidenceList .evidence-card, .empty-project' },
    { page: 'map', sel: '.map-wrap, .empty-project' },
    { page: 'builder', sel: '.outline, .empty-project' },
    { page: 'builder', sel: '#langSwitch' }
  ];
  let tour = null;

  function startTour() {
    if (currentPage() === 'home') { state.seenLanding = true; navigate('dashboard'); }
    if (!$('#tourLayer')) {
      const layer = document.createElement('div');
      layer.id = 'tourLayer';
      layer.innerHTML = `<div class="tour-block"></div><div class="tour-spot"></div><div class="tour-pop" role="dialog" aria-modal="true" aria-live="polite"></div>`;
      document.body.appendChild(layer);
    }
    tour = { i: 0 };
    showTourStep();
  }

  function showTourStep() {
    const step = TOUR[tour.i];
    let delay = 40;
    if (step.page && currentPage() !== step.page) { navigate(step.page); delay = 160; }
    if (step.sidebar && isNarrow()) { delay = Math.max(delay, 160) + 280; setTimeout(openSidebar, delay - 280); }
    else if (isNarrow()) closeSidebar();
    $('#tourLayer').classList.add('is-moving');
    setTimeout(() => {
      if (!tour) return;
      const el = step.sel && $(step.sel);
      if (el && !step.sidebar) {
        const r = el.getBoundingClientRect();
        if (r.height > window.innerHeight - 200) window.scrollTo({ top: window.scrollY + r.top - 90 });
        else window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2 });
      }
      positionTour();
      $('#tourLayer').classList.remove('is-moving');
    }, delay);
  }

  function positionTour() {
    if (!tour) return;
    const layer = $('#tourLayer');
    const step = TOUR[tour.i];
    const total = TOUR.length;
    const last = tour.i === total - 1;
    const pop = $('.tour-pop', layer);
    const spot = $('.tour-spot', layer);

    pop.innerHTML = `
      ${tour.i > 0 ? `<span class="tour-count">${t('tour.count', { i: tour.i, n: total - 1 })}</span>` : '<span class="tour-badge"><i data-lucide="compass"></i></span>'}
      <h3>${t(`tour.${tour.i}.t`)}</h3>
      <p>${t(`tour.${tour.i}.b`)}</p>
      ${tour.i > 0 ? `<div class="tour-dots">${TOUR.slice(1).map((_, k) => `<span class="${k + 1 === tour.i ? 'on' : ''}"></span>`).join('')}</div>` : ''}
      <div class="tour-actions">
        <button class="btn btn-ghost btn-sm" data-action="tour-skip">${t('tour.skip')}</button>
        <span class="spacer"></span>
        ${tour.i > 1 ? `<button class="btn btn-outline btn-sm" data-action="tour-back">${t('tour.back')}</button>` : ''}
        <button class="btn btn-primary btn-sm" data-action="tour-next">${tour.i === 0 ? t('tour.start') : last ? t('tour.finish') : t('tour.next')}</button>
      </div>`;
    icons();

    const el = step.sel && $(step.sel);
    const rect = el && el.getBoundingClientRect();
    const visible = rect && rect.width > 0 && rect.height > 0;
    layer.classList.toggle('centered', !visible);

    const vw = window.innerWidth, vh = window.innerHeight, gap = 14, pad = 6;
    const pw = Math.min(360, vw - 32);
    pop.style.width = pw + 'px';
    const ph = pop.offsetHeight;

    if (!visible) {
      spot.style.cssText = 'opacity:0';
      pop.style.left = (vw - pw) / 2 + 'px';
      pop.style.top = Math.max(16, (vh - ph) / 2) + 'px';
      return;
    }
    const top = Math.max(rect.top, 8), bottom = Math.min(rect.bottom, vh - 8);
    const box = { left: rect.left - pad, top: top - pad, width: rect.width + pad * 2, height: bottom - top + pad * 2 };
    spot.style.cssText = `opacity:1;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px`;

    let left, ptop;
    if (box.left + box.width + gap + pw < vw - 12) {            // right
      left = box.left + box.width + gap; ptop = box.top;
    } else if (box.top + box.height + gap + ph < vh - 12) {     // below
      left = box.left; ptop = box.top + box.height + gap;
    } else if (box.top - gap - ph > 12) {                       // above
      left = box.left; ptop = box.top - gap - ph;
    } else if (box.left - gap - pw > 12) {                      // left
      left = box.left - gap - pw; ptop = box.top;
    } else {                                                    // overlap, bottom of screen
      left = (vw - pw) / 2; ptop = vh - ph - 16;
    }
    pop.style.left = Math.min(Math.max(12, left), vw - pw - 12) + 'px';
    pop.style.top = Math.min(Math.max(12, ptop), vh - ph - 12) + 'px';
  }

  function endTour(completed) {
    tour = null;
    const layer = $('#tourLayer');
    if (layer) layer.remove();
    closeSidebar();
    state.tourDone = true;
    persist();
    if (completed) { toast(t('tour.done'), { icon: 'party-popper' }); navigate('dashboard'); }
    else if (currentPage() === 'dashboard') refresh();
  }

  /* ------------------------------------------------------
     10. EVENT HANDLING
     ------------------------------------------------------ */
  const actions = {
    'open-new-project': () => openModal(),
    'close-modal': () => closeModal(),
    'toggle-sidebar': () => $('.app').classList.contains('nav-open') ? closeSidebar() : openSidebar(),
    'close-sidebar': () => closeSidebar(),
    'go': (el) => navigate(el.dataset.page),
    'set-lang': (el) => setLang(el.dataset.lang),

    // Landing
    'enter-app': () => enterApp(),
    'scroll-to': (el, ev) => { ev.preventDefault(); const target = document.getElementById(el.dataset.target); if (target) target.scrollIntoView({ behavior: 'smooth' }); },

    // Tour
    'start-tour': () => startTour(),
    'toggle-guide': (el) => { const pg = el.dataset.page; state.guidesHidden[pg] = !state.guidesHidden[pg]; persist(); refresh(); },
    'hide-guide': (el) => { state.guidesHidden[el.dataset.page] = true; persist(); refresh(); toast(t('g.hidden'), { icon: 'book-open' }); },
    'tour-next': () => { if (tour.i >= TOUR.length - 1) endTour(true); else { tour.i++; showTourStep(); } },
    'tour-back': () => { if (tour.i > 0) { tour.i--; showTourStep(); } },
    'tour-skip': () => endTour(false),

    // Projects
    'edit-source': (el, ev) => { ev.stopPropagation(); openSourceEditor(el.dataset.id); },
    'close-src': () => closeSourceEditor(),
    'lookup-doi': async (el) => {
      const input = $('#sfDoi');
      const doi = findDoi(input.value) || input.value.trim();
      if (!doi) { input.focus(); return; }
      el.disabled = true;
      try {
        const meta = await lookupDoi(doi);
        const set = (id, v) => { const x = $(id); if (x && v !== undefined && v !== null) x.value = v; };
        set('#sfDoi', meta.doi); set('#sfType', meta.type); set('#sfYear', meta.year); set('#sfTitle', meta.title);
        set('#sfAuthors', meta.authors.map(a => a.given ? `${a.family}, ${a.given}` : a.family).join('\n'));
        set('#sfJournal', meta.journal); set('#sfVol', meta.volume); set('#sfIss', meta.issue); set('#sfPages', meta.range); set('#sfPub', meta.publisher);
        updateSourcePreview();
        toast(t('src.lookupOk'), { icon: 'badge-check' });
      } catch (e) {
        toast(t('src.lookupFail'), { icon: 'triangle-alert', type: 'warn' });
      }
      el.disabled = false;
    },
    'open-project': (el, ev) => {
      if (ev.target.closest('[data-action="delete-project"]')) return;
      switchProject(el.dataset.id);
      navigate(el.dataset.goto || 'evidence');
    },
    'delete-project': (el, ev) => {
      ev.stopPropagation();
      const p = state.projects.find(x => x.id === el.dataset.id);
      if (!p || !confirm(t('proj.confirmDelete', { t: L(p.title) }))) return;
      state.projects = state.projects.filter(x => x.id !== p.id);
      delete state.saved[p.id]; delete state.outlines[p.id]; delete state.userEvidence[p.id]; delete state.maps[p.id];
      p.sources.forEach(s => { PASSAGES.delete(s.id); idb.del(s.id).catch(() => {}); });
      if (state.currentProjectId === p.id) { state.currentProjectId = state.projects[0] ? state.projects[0].id : null; resetLibraryFilters(); }
      commit(); refresh();
      toast(t('proj.deleted'), { icon: 'trash-2' });
    },

    // Evidence library
    'toggle-save': (el) => {
      toggleSave(el.dataset.id);
      if (currentPage() === 'evidence') { renderEvidenceList(); renderAnswer(); }
      else if (currentPage() === 'map') drawMap();
    },
    'filter-source': (el) => { ui.lib.source = el.dataset.id; refresh(); },
    'set-tab': (el) => { ui.lib.tab = el.dataset.tab; $$('.tab').forEach(x => x.classList.toggle('active', x === el)); renderEvidenceList(); },
    'set-theme': (el) => { ui.lib.theme = el.dataset.theme; $$('[data-action="set-theme"]').forEach(c => c.classList.toggle('active', c === el)); renderEvidenceList(); },
    'clear-filters': () => { ui.lib = { ...ui.lib, query: '', theme: 'all', source: 'all' }; $('#globalSearch').value = ''; refresh(); },
    'ask-suggestion': (el) => { $('#askInput').value = el.dataset.q; askQuestion(el.dataset.q); },
    'clear-answer': () => { ui.answer = null; renderAnswer(); },
    'jump-card': (el) => {
      const card = $('#answerArea #card-' + el.dataset.id) || $('#card-' + el.dataset.id);
      if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.animate([{ boxShadow: '0 0 0 4px rgba(82,96,200,.35)' }, { boxShadow: '0 0 0 0 rgba(82,96,200,0)' }], { duration: 1200 }); }
    },
    'upload-source': () => $('#sourceUpload').click(),
    'remove-file': (el) => { ui.pendingFiles.splice(+el.dataset.index, 1); renderPendingFiles(); },
    'view-in-map': (el) => { ui.mapSelected = 'e:' + el.dataset.id; navigate('map'); },
    'copy-ref': (el) => {
      const src = currentProject().sources.find(s => s.id === el.dataset.source);
      if (!src) return;
      const style = state.user.citation;
      copyText(stripTags(reference(src, style, sourceNumber(src))), () => toast(t('ev.refCopied', { s: CITATION_STYLES[style].label }), { icon: 'clipboard-check' }));
    },

    // References
    'open-refs': () => openRefs(),
    'open-refs-used': () => openRefs(usedSourceIds()),
    'close-ref': () => closeRefs(),
    'copy-ref-list': () => {
      const txt = referenceList(refSources(), ui.refStyle).map(r => stripTags(r.html)).join('\n');
      copyText(txt, () => toast(t('ref.copied'), { icon: 'clipboard-check' }));
    },

    // Insight map
    'select-node': (el) => {
      if (ui.suppressClick) return;   // the press was a drag, not a click
      const id = el.dataset.id;
      // Second click while connecting: open the link form
      if (ui.linkFrom && id.startsWith('e:') && id.slice(2) !== ui.linkFrom) {
        ui.linkDraft = { a: ui.linkFrom, b: id.slice(2), type: 'different' };
        ui.linkFrom = null;
        ui.mapSelected = id;
        drawMap();
        return;
      }
      ui.mapSelected = ui.mapSelected === id && el.classList.contains('map-node') ? null : id;
      drawMap();
    },
    'clear-selection': () => { ui.mapSelected = null; ui.linkFrom = null; ui.linkDraft = null; drawMap(); },
    'library-theme': (el) => { ui.lib = { query: '', theme: el.dataset.theme, source: 'all', tab: 'saved' }; navigate('evidence'); },
    'map-auto': () => autoGroup(true),
    'map-reset-layout': () => { mapFor().pos = {}; persist(); drawMap(); },
    'map-add-theme': () => {
      const m = mapFor();
      const th = { id: uid('t'), name: t('map.themeN', { n: m.themes.length + 1 }), color: THEME_PALETTE[m.themes.length % THEME_PALETTE.length] };
      m.themes.push(th);
      persist();
      ui.mapSelected = 't:' + th.id;
      drawMap();
      const input = $('#themeName'); if (input) { input.focus(); input.select(); }
    },
    'map-theme-color': (el) => {
      const th = mapFor().themes.find(x => x.id === el.dataset.id);
      if (th) { th.color = el.dataset.color; persist(); drawMap(); }
    },
    'map-delete-theme': (el) => {
      const m = mapFor();
      const th = m.themes.find(x => x.id === el.dataset.id);
      if (!th || !confirm(t('map.deleteThemeConfirm', { t: th.name }))) return;
      m.themes = m.themes.filter(x => x.id !== th.id);
      Object.keys(m.assign).forEach(k => { if (m.assign[k] === th.id) delete m.assign[k]; });
      delete m.pos['t:' + th.id];
      persist();
      ui.mapSelected = null;
      drawMap();
    },
    'map-start-link': (el) => { ui.linkFrom = el.dataset.id; ui.linkDraft = null; ui.mapSelected = null; drawMap(); },
    'map-cancel-link': () => { ui.linkFrom = null; ui.linkDraft = null; drawMap(); },
    'map-delete-link': (el) => {
      const m = mapFor();
      m.links = m.links.filter(l => l.id !== el.dataset.id);
      touchProject(); commit(); drawMap();
    },
    'map-keep-link': (el) => {
      mapFor().links.push({ id: uid('l'), a: el.dataset.a, b: el.dataset.b, type: 'similar', note: '' });
      touchProject(); commit(); drawMap();
    },
    'map-dismiss-link': (el) => {
      mapFor().dismissed.push([el.dataset.a, el.dataset.b].sort().join('|'));
      persist(); drawMap();
    },

    // Argument builder
    'edit-thesis': () => { ui.editingThesis = true; refresh(); const ta = $('#thesisForm textarea'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } },
    'cancel-thesis': () => { ui.editingThesis = false; refresh(); },
    'add-arg': () => {
      if (ui.newArgId) return;
      const a = { id: uid('a'), type: 'supporting', claim: '', explanation: '', evidence: [] };
      outlineFor().args.push(a);
      ui.editingArg = a.id; ui.newArgId = a.id;
      refresh();
      const form = $('#argForm-' + a.id); if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    'edit-arg': (el) => { cancelNewArg(); ui.editingArg = el.dataset.id; refresh(); },
    'cancel-arg': () => { cancelNewArg(); ui.editingArg = null; refresh(); },
    'delete-arg': (el) => {
      const o = outlineFor();
      const a = o.args.find(x => x.id === el.dataset.id);
      if (!a || !confirm(t('b.confirmDel', { t: L(a.claim) || t('b.untitled') }))) return;
      o.args = o.args.filter(x => x.id !== a.id);
      touchProject(); logActivity('trash-2', 'act.deletedSec', { t: truncate(L(a.claim), 50) }); commit(); refresh();
      toast(t('b.deleted'), { icon: 'trash-2' });
    },
    'move-arg': (el) => {
      const o = outlineFor();
      const i = o.args.findIndex(x => x.id === el.dataset.id);
      const j = i + Number(el.dataset.dir);
      if (i < 0 || j < 0 || j >= o.args.length) return;
      [o.args[i], o.args[j]] = [o.args[j], o.args[i]];
      touchProject(); commit(); refresh();
    },
    'unlink-evidence': (el) => {
      const a = outlineFor().args.find(x => x.id === el.dataset.arg);
      if (!a) return;
      a.evidence = a.evidence.filter(id => id !== el.dataset.id);
      touchProject(); commit(); refresh();
    },
    'export-outline': () => exportOutline(),

    // Settings
    'reset-demo': () => {
      if (!confirm(t('set.resetConfirm'))) return;
      const lang = state.lang;
      state = seedState(); state.lang = lang; state.seenLanding = true; state.tourDone = true;
      PASSAGES.clear(); idb.clear().catch(() => {});
      resetLibraryFilters(); persist();
      toast(t('set.resetDone'), { icon: 'rotate-ccw' });
      navigate('dashboard');
    }
  };

  function cancelNewArg() {
    if (!ui.newArgId) return;
    const o = outlineFor();
    o.args = o.args.filter(a => a.id !== ui.newArgId);
    ui.newArgId = null;
  }

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el, ev);
  });

  document.addEventListener('keydown', (ev) => {
    if (tour) {
      if (ev.key === 'Escape') { endTour(false); return; }
      if (ev.key === 'ArrowRight') { actions['tour-next'](); return; }
      if (ev.key === 'ArrowLeft') { actions['tour-back'](); return; }
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.project-card[role="button"]')) {
      ev.preventDefault(); ev.target.click();
    }
    if (ev.key === 'Escape') {
      if ($('#srcModal') && !$('#srcModal').hidden) closeSourceEditor();
      else if (!$('#projectModal').hidden) closeModal();
      else if (!$('#refModal').hidden) closeRefs();
      else if ((ui.mapSelected || ui.linkFrom || ui.linkDraft) && currentPage() === 'map') { ui.mapSelected = null; ui.linkFrom = null; ui.linkDraft = null; drawMap(); }
      closeSidebar();
    }
    if (ev.key === '/' && currentPage() !== 'home' && !ev.target.matches('input, textarea, select, [contenteditable]')) {
      ev.preventDefault(); $('#globalSearch').focus();
    }
    if (ev.key === 'Enter' && !ev.shiftKey && ev.target.id === 'askInput') {
      ev.preventDefault(); askQuestion(ev.target.value);
    }
  });

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.id === 'libSearch') { ui.lib.query = el.value; renderEvidenceList(); }
    if (el.id === 'projectSearch') { ui.projectSearch = el.value; renderProjectGrid(); }
    if (el.closest && el.closest('#srcForm')) updateSourcePreview();
    if (el.id === 'askInput') { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
    if (el.id === 'pfTitle' && el.value.trim()) { $('#pfTitleError').hidden = true; el.closest('.field').classList.remove('invalid'); }
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.id === 'projectSelect') { switchProject(el.value); refresh(); toast(t('proj.switched', { t: L(currentProject().title) }), { icon: 'folder-open' }); }
    if (el.id === 'projectFiles') { addPendingFiles(el.files); el.value = ''; }
    if (el.id === 'sourceUpload') { addSourcesToCurrent(el.files); el.value = ''; }
    if (el.id === 'refStyleSel') { ui.refStyle = el.value; renderRefs(); }
    if (el.id === 'themeName') {
      const th = mapFor().themes.find(x => x.id === el.dataset.themeId);
      if (th && el.value.trim()) { th.name = el.value.trim(); touchProject(); commit(); drawMap(); }
    }
    if (el.dataset.evTheme !== undefined) {
      const m = mapFor();
      if (el.value) m.assign[el.dataset.evTheme] = el.value; else delete m.assign[el.dataset.evTheme];
      delete m.pos['e:' + el.dataset.evTheme];
      touchProject(); commit(); drawMap();
    }
    if (el.id === 'setCite') updateCitePreview(el.value);
    if (el.closest && el.closest('#srcForm')) updateSourcePreview();
    if (el.dataset.connFilter) { ui.mapFilters[el.dataset.connFilter] = el.checked; drawMap(); }
    if (el.dataset.linkSelect && el.value) linkEvidence(el.dataset.linkSelect, el.value);
  });

  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    ev.preventDefault();
    if (f.id === 'projectForm') createProject(f);
    if (f.id === 'linkForm') {
      const d = ui.linkDraft;
      if (d) {
        const type = (f.querySelector('input[name=type]:checked') || {}).value || 'different';
        mapFor().links.push({ id: uid('l'), a: d.a, b: d.b, type, note: f.note.value.trim() });
        logActivity('link-2', 'act.mapLink', { t: t('conn.' + type) });
        touchProject(); commit();
        toast(t('map.linkSaved'), { icon: 'link-2' });
      }
      ui.linkDraft = null;
      drawMap();
    }
    if (f.id === 'srcForm') {
      const src = currentProject().sources.find(s => s.id === ui.editingSource);
      if (src) {
        const draft = sourceFromForm();
        Object.assign(src, draft);
        if (!draft.org) delete src.org;
        if (!draft.authors.length) src.authors = [];
        touchProject(); commit();
      }
      closeSourceEditor();
      refresh();
      if (!$('#refModal').hidden) renderRefs();
      toast(t('src.saved'), { icon: 'badge-check' });
    }
    if (f.id === 'askForm') askQuestion($('#askInput').value);
    if (f.id === 'globalSearchForm') {
      ui.lib = { query: $('#globalSearch').value.trim(), theme: 'all', source: 'all', tab: 'all' };
      navigate('evidence');
    }
    if (f.id === 'thesisForm') {
      outlineFor().thesis = f.thesis.value.trim();
      ui.editingThesis = false;
      touchProject(); logActivity('target', 'act.thesis'); commit(); refresh();
      toast(t('b.thesisSaved'));
    }
    if (f.id && f.id.startsWith('argForm-')) {
      const a = outlineFor().args.find(x => x.id === f.dataset.id);
      const claim = f.claim.value.trim();
      if (!a) return;
      if (!claim) { f.claim.focus(); f.claim.closest('.field').classList.add('invalid'); return; }
      const isNew = ui.newArgId === a.id;
      a.claim = claim; a.explanation = f.explanation.value.trim(); a.type = f.type.value;
      ui.editingArg = null; ui.newArgId = null;
      touchProject(); logActivity('list-tree', isNew ? 'act.addedSec' : 'act.editedSec', { t: truncate(claim, 50) }); commit(); refresh();
      toast(t(isNew ? 'b.added' : 'b.updated'));
    }
    if (f.id === 'settingsForm') {
      const d = new FormData(f);
      state.user.name = (d.get('name') || '').trim() || 'Student';
      state.user.university = (d.get('university') || '').trim();
      state.user.program = (d.get('program') || '').trim();
      state.user.citation = d.get('citation');
      state.lang = d.get('lang');
      ui.answer = null;
      commit();
      refresh();
      toast(t('set.saved'));
    }
  });

  /* Modal dropzone drag & drop */
  const dz = $('#dropzone');
  ['dragenter', 'dragover'].forEach(x => dz.addEventListener(x, (e) => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(x => dz.addEventListener(x, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) addPendingFiles(e.dataTransfer.files); });
  $('#projectModal').addEventListener('mousedown', (e) => { if (e.target.id === 'projectModal') closeModal(); });
  $('#refModal').addEventListener('mousedown', (e) => { if (e.target.id === 'refModal') closeRefs(); });

  /* ---------- Argument Builder drag & drop ---------- */
  let drag = null;
  document.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.arg-handle');
    const card = handle && handle.closest('.arg-card:not(.arg-form)');
    if (card) card.setAttribute('draggable', 'true');
  });
  document.addEventListener('mouseup', () => { if (!drag) $$('.arg-card[draggable]').forEach(c => c.removeAttribute('draggable')); });

  document.addEventListener('dragstart', (e) => {
    const trayItem = e.target.closest && e.target.closest('[data-drag-evidence]');
    const card = e.target.closest && e.target.closest('.arg-card[draggable="true"]');
    if (trayItem) {
      drag = { kind: 'evidence', id: trayItem.dataset.dragEvidence };
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', drag.id);
      trayItem.classList.add('dragging');
    } else if (card) {
      drag = { kind: 'arg', id: card.dataset.id };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', drag.id);
      requestAnimationFrame(() => card.classList.add('dragging'));
    }
  });
  document.addEventListener('dragover', (e) => {
    if (!drag) return;
    if (drag.kind === 'evidence') {
      const card = e.target.closest('.arg-card:not(.arg-form)');
      $$('.arg-card.drop-target').forEach(c => { if (c !== card) c.classList.remove('drop-target'); });
      if (card) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; card.classList.add('drop-target'); }
    } else {
      const list = $('#argList');
      if (!list || !list.contains(e.target)) return;
      e.preventDefault();
      const dragging = $('.arg-card.dragging');
      if (!dragging) return;
      const after = $$('.arg-card:not(.dragging)', list).find(c => { const b = c.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; });
      if (after) list.insertBefore(dragging, after); else list.appendChild(dragging);
    }
  });
  document.addEventListener('drop', (e) => {
    if (!drag) return;
    e.preventDefault();
    if (drag.kind === 'evidence') {
      const card = e.target.closest('.arg-card:not(.arg-form)');
      if (card) linkEvidence(card.dataset.id, drag.id);
    }
  });
  document.addEventListener('dragend', () => {
    if (!drag) return;
    if (drag.kind === 'arg') {
      const order = $$('#argList .arg-card').map(c => c.dataset.id);
      const o = outlineFor();
      const before = o.args.map(a => a.id).join();
      o.args.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      if (before !== o.args.map(a => a.id).join()) { touchProject(); commit(); toast(t('b.reordered'), { icon: 'list-tree' }); }
    }
    drag = null;
    $$('.dragging, .drop-target').forEach(el => el.classList.remove('dragging', 'drop-target'));
    if (currentPage() === 'builder') refresh();
  });

  /* ---------- Boot ---------- */
  window.addEventListener('hashchange', () => renderPage());
  window.addEventListener('resize', () => { if (tour) positionTour(); });
  window.addEventListener('scroll', () => { if (tour) positionTour(); }, { passive: true });
  renderPage();
  loadStoredPassages();
})();
