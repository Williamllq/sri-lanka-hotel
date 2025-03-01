/**
 * 语言切换补丁 - 解决当前语言切换问题
 * 这个脚本会覆盖其他语言脚本的功能，确保语言切换正常工作
 */

(function() {
    // 立即执行函数，防止全局变量污染
    console.log("🛠️ 语言补丁正在加载...");

    // 1. 基本配置
    const LANGUAGES = {
        'en': { name: 'English', flag: '🇬🇧' },
        'zh': { name: '中文', flag: '🇨🇳' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'si': { name: 'සිංහල', flag: '🇱🇰' }
    };

    // 2. 内置基础翻译 - 确保核心功能可用
    const TRANSLATIONS = {
        'zh': {
            // 导航
            'home': '首页',
            'transport': '交通',
            'explore': '探索',
            'contact': '联系我们',
            
            // 主页
            'hero-title': '最佳旅行 - 最佳选择',
            'hero-subtitle': '您在斯里兰卡的高级旅行体验',
            'book-transport': '预订交通',
            'explore-lanka': '探索斯里兰卡',
            
            // 交通服务
            'transport-services': '交通服务',
            'safe-comfortable': '安全舒适的车辆',
            'vehicle-desc': '整洁且维护良好的车辆，确保您在斯里兰卡旅行途中舒适',
            'passengers': '最多容纳4位乘客',
            'luggage': '大型行李空间',
            'ac': '空调',
            'safety': '安全特性',
            
            // 预订旅程
            'book-journey': '预订您的旅程',
            'deposit-info': '需要支付30%的订金来确认您的预订',
            'service-type': '服务类型',
            'select-service': '选择服务',
            'airport-transfer': '机场接送',
            'private-charter': '私人包车',
            'guided-tour': '导游团',
            'date': '日期',
            'time': '时间',
            'pickup-location': '接送地点',
            'enter-pickup': '输入接送地点',
            'destination': '目的地',
            'enter-destination': '输入目的地',
            'requirements': '特殊要求',
            'enter-requirements': '任何特殊要求？',
            
            // 探索部分
            'quality-vehicle': '高品质车辆',
            'quality-desc': '精心维护的车辆确保您旅途中的舒适与安全',
            'expert-driver': '当地专业司机',
            'driver-desc': '会讲英语的专业司机，拥有丰富的当地知识',
            'protection': '全程保障',
            'protection-desc': '全天候陪伴与安全保障',
            'insider': '内部知识',
            'insider-desc': '带您探索隐藏景点和体验真实的当地生活',
            
            // 探索斯里兰卡
            'discover-lanka': '探索斯里兰卡',
            'tea-plantations': '茶园',
            'visit-tea': '参观世界著名的锡兰茶园',
            'wildlife-safari': '野生动物之旅',
            'experience-wildlife': '体验独特的野生动物邂逅',
            'cultural-heritage': '文化遗产',
            'discover-temples': '探索古老的寺庙和历史遗迹',
            'discover-more': '发现更多',
            
            // 客户评价
            'what-clients-say': '客户评价',
            'testimonial-1': '极好的服务！司机非常专业，知识渊博。使我们在斯里兰卡的旅行难忘。',
            'testimonial-2': '车辆非常舒适，服务可靠。司机准时友好。强烈推荐！',
            'testimonial-3': '很棒的体验！司机了解所有最佳景点，帮助我们探索真实的斯里兰卡。',
            'from-uk': '来自英国',
            'from-china': '来自中国',
            'from-germany': '来自德国',
            
            // 酒店住宿
            'luxurious-accommodations': '豪华住宿',
            'ocean-suite': '海景套房',
            'ocean-desc': '醒来即可欣赏印度洋的壮丽景色',
            'garden-suite': '热带花园套房',
            'garden-desc': '沉浸在郁郁葱葱的热带花园中',
            'pool-villa': '私人泳池别墅',
            'pool-desc': '拥有私人无边泳池的终极奢华体验',
            'king-bed': '特大床',
            'queen-bed': '大床',
            'free-wifi': '免费WiFi',
            'from-price': '起价',
            'per-night': '/晚',
            
            // 联系我们
            'give-feedback': '提供反馈',
            'share-experience': '分享您的体验',
            'name': '姓名',
            'country': '国家',
            'rating': '评分',
            'your-feedback': '您的反馈',
            'submit-feedback': '提交反馈',
            
            // AI助手
            'travel-assistant': '旅行助手',
            'ai-welcome': '您好！我是您的斯里兰卡旅行助手。我可以帮助您：',
            'hotel-info': '酒店信息',
            'local-attractions': '当地景点',
            'travel-tips': '旅行提示',
            'booking-assistance': '预订帮助',
            'how-assist': '我今天能为您做些什么？',
            'ask-anything': '关于斯里兰卡，您可以问我任何问题...',
            'need-help': '需要帮助？'
        },
        'de': {
            // 导航
            'home': 'Startseite',
            'transport': 'Transport',
            'explore': 'Entdecken',
            'contact': 'Kontakt',
            
            // 主页
            'hero-title': 'Beste Reise - Beste Wahl',
            'hero-subtitle': 'Ihr Premium-Reiseerlebnis in Sri Lanka',
            'book-transport': 'Transport buchen',
            'explore-lanka': 'Sri Lanka entdecken',
            
            // 服务部分
            'transport-services': 'Transportdienstleistungen',
            'discover-lanka': 'Entdecken Sie Sri Lanka',
            'need-help': 'Brauchen Sie Hilfe?',
            
            // 预订表单
            'book-your-journey': 'Buchen Sie Ihre Reise',
            'deposit-required': '30% Anzahlung erforderlich zum Zeitpunkt der Buchung',
            'service-type': 'Serviceart',
            'select-service': 'Service auswählen',
            'pickup-location': 'Abholort',
            'enter-pickup': 'Abholort eingeben',
            'destination': 'Zielort',
            'enter-destination': 'Zielort eingeben',
            'special-requirements': 'Besondere Anforderungen',
            'any-requirements': 'Irgendwelche besonderen Anforderungen?',
            'from': 'Von',
            'to': 'Nach',
            'date': 'Datum',
            'time': 'Zeit',
            'passengers': 'Passagiere',
            'vehicle-type': 'Fahrzeugtyp',
            'car': 'Auto',
            'van': 'Van',
            'suv': 'SUV',
            'bus': 'Bus',
            'get-quote': 'Angebot erhalten',
            'book-now': 'Jetzt buchen',
            
            // 车辆特点
            'comfort': 'Komfort',
            'well-maintained': 'Gut gewartete Fahrzeuge für Ihre komfortable Reise durch Sri Lanka',
            'passengers': 'Passagiere',
            'luggage-space': 'Gepäckraum',
            'air-conditioning': 'Klimaanlage',
            'safety': 'Sicherheit',
            
            // 探索部分
            'explore-sri-lanka': 'Entdecken Sie Sri Lanka',
            'discover-beauty': 'Entdecken Sie die Schönheit und das Erbe von Sri Lanka',
            'beaches': 'Strände',
            'wildlife': 'Tierwelt',
            'heritage': 'Kulturerbe',
            'culture': 'Kultur',
            'view-more': 'Mehr anzeigen',
            
            // 酒店部分
            'hotel-accommodations': 'Hotelunterkünfte',
            'find-best-hotels': 'Finden Sie die besten Hotels für Ihren Aufenthalt',
            'luxury-room': 'Luxuszimmer',
            'deluxe-room': 'Deluxe-Zimmer',
            'standard-room': 'Standardzimmer',
            'view-details': 'Details anzeigen',
            'amenities': 'Annehmlichkeiten',
            'price-night': 'Preis pro Nacht',
            
            // 联系部分
            'contact-us': 'Kontaktieren Sie uns',
            'contact-desc': 'Haben Sie Fragen oder benötigen Sie Hilfe bei der Planung Ihrer Reise? Kontaktieren Sie uns!',
            'name': 'Name',
            'email': 'E-Mail',
            'message': 'Nachricht',
            'send': 'Senden',
            'your-feedback': 'Ihr Feedback',
            'submit-feedback': 'Feedback einreichen',
            
            // AI助手
            'travel-assistant': 'Reiseassistent',
            'ai-welcome': 'Willkommen! Ich bin Ihr Sri Lanka Reiseassistent. Ich kann Ihnen helfen mit:',
            'hotel-info': 'Hotelinformationen',
            'local-attractions': 'Lokale Attraktionen',
            'travel-tips': 'Reisetipps',
            'booking-assistance': 'Buchungsunterstützung',
            'how-assist': 'Wie kann ich Ihnen heute helfen?',
            'ask-anything': 'Fragen Sie mich alles über Sri Lanka...',
            'need-help': 'Brauchen Sie Hilfe?'
        },
        'fr': {
            'home': 'Accueil',
            'transport': 'Transport',
            'explore': 'Explorer',
            'contact': 'Contact',
            'hero-title': 'Meilleur Voyage - Meilleur Choix',
            'hero-subtitle': 'Votre expérience de voyage premium au Sri Lanka',
            'book-transport': 'Réserver un transport',
            'explore-lanka': 'Explorer le Sri Lanka',
            'transport-services': 'Services de transport',
            'discover-lanka': 'Découvrez le Sri Lanka',
            'need-help': 'Besoin d\'aide?',
            
            // Booking journey
            'book-your-journey': 'Réservez votre voyage',
            'deposit-required': '30% d\'acompte requis au moment de la réservation',
            'from': 'De',
            'to': 'À',
            'date': 'Date',
            'time': 'Heure',
            'passengers': 'Passagers',
            'vehicle-type': 'Type de véhicule',
            'car': 'Voiture',
            'van': 'Van',
            'suv': 'SUV',
            'bus': 'Bus',
            'get-quote': 'Obtenir un devis',
            'book-now': 'Réserver maintenant',
            
            // Explore section
            'explore-sri-lanka': 'Explorez le Sri Lanka',
            'beaches-title': 'Plages de rêve',
            'beaches-desc': 'Profitez des eaux cristallines et des plages de sable doré le long de la côte du Sri Lanka.',
            'wildlife-title': 'Faune exotique',
            'wildlife-desc': 'Découvrez la faune diversifiée dans les parcs nationaux avec des éléphants, des léopards et des oiseaux colorés.',
            'culture-title': 'Riche culture',
            'culture-desc': 'Immergez-vous dans une culture vieille de 2500 ans avec des temples, des ruines et des traditions vivantes.',
            'cuisine-title': 'Cuisine délicieuse',
            'cuisine-desc': 'Goûtez aux currys épicés, aux fruits de mer frais et aux fruits exotiques que le Sri Lanka a à offrir.',
            
            // Testimonials
            'what-customers-say': 'Ce que disent nos clients',
            'customer-review-1': 'Notre chauffeur était ponctuel, amical et très bien informé sur les attractions. La voiture était très confortable pour notre long voyage.',
            'customer-name-1': 'Sophie Dupont',
            
            // Accommodation
            'accommodation': 'Hébergement',
            'book-hotels': 'Réserver des hôtels',
            'luxury-room': 'Chambre de luxe',
            'deluxe-room': 'Chambre deluxe',
            'standard-room': 'Chambre standard',
            'view-details': 'Voir les détails',
            'amenities': 'Équipements',
            'price-night': 'Prix par nuit',
            
            // Contact
            'contact-us': 'Contactez-nous',
            'contact-desc': 'Vous avez des questions ou besoin d\'aide pour planifier votre voyage? Contactez-nous!',
            'name': 'Nom',
            'email': 'Email',
            'message': 'Message',
            'send': 'Envoyer',
            'your-feedback': 'Votre avis',
            'submit-feedback': 'Soumettre',
            
            // AI Assistant
            'travel-assistant': 'Assistant de voyage',
            'ai-welcome': 'Bonjour! Je suis votre assistant de voyage au Sri Lanka. Je peux vous aider avec:',
            'hotel-info': 'Informations sur les hôtels',
            'local-attractions': 'Attractions locales',
            'travel-tips': 'Conseils de voyage',
            'booking-assistance': 'Aide à la réservation',
            'how-assist': 'Comment puis-je vous aider aujourd\'hui?',
            'ask-anything': 'Posez-moi n\'importe quelle question sur le Sri Lanka...',
            'need-help': 'Besoin d\'aide?'
        },
        'es': {
            'home': 'Inicio',
            'transport': 'Transporte',
            'explore': 'Explorar',
            'contact': 'Contacto',
            'hero-title': 'Mejor Viaje - Mejor Elección',
            'hero-subtitle': 'Su experiencia de viaje premium en Sri Lanka',
            'book-transport': 'Reservar transporte',
            'explore-lanka': 'Explorar Sri Lanka',
            'transport-services': 'Servicios de transporte',
            'discover-lanka': 'Descubra Sri Lanka',
            'need-help': '¿Necesita ayuda?',
            
            // Booking journey
            'book-your-journey': 'Reserve su viaje',
            'deposit-required': 'Se requiere un depósito del 30% en el momento de la reserva',
            'from': 'Desde',
            'to': 'Hasta',
            'date': 'Fecha',
            'time': 'Hora',
            'passengers': 'Pasajeros',
            'vehicle-type': 'Tipo de vehículo',
            'car': 'Coche',
            'van': 'Furgoneta',
            'suv': 'SUV',
            'bus': 'Autobús',
            'get-quote': 'Obtener presupuesto',
            'book-now': 'Reservar ahora',
            
            // Explore section
            'explore-sri-lanka': 'Explore Sri Lanka',
            'beaches-title': 'Playas de ensueño',
            'beaches-desc': 'Disfrute de las aguas cristalinas y playas de arena dorada a lo largo de la costa de Sri Lanka.',
            'wildlife-title': 'Fauna exótica',
            'wildlife-desc': 'Descubra la diversa vida silvestre en los parques nacionales con elefantes, leopardos y coloridas aves.',
            'culture-title': 'Rica cultura',
            'culture-desc': 'Sumérjase en una cultura de 2500 años con templos, ruinas y tradiciones vivas.',
            'cuisine-title': 'Deliciosa cocina',
            'cuisine-desc': 'Pruebe los currys picantes, mariscos frescos y frutas exóticas que Sri Lanka tiene para ofrecer.',
            
            // Testimonials
            'what-customers-say': 'Lo que dicen nuestros clientes',
            'customer-review-1': 'Nuestro conductor fue puntual, amigable y muy conocedor de las atracciones. El coche era muy cómodo para nuestro largo viaje.',
            'customer-name-1': 'Carlos Rodríguez',
            
            // Accommodation
            'accommodation': 'Alojamiento',
            'book-hotels': 'Reservar hoteles',
            'luxury-room': 'Habitación de lujo',
            'deluxe-room': 'Habitación deluxe',
            'standard-room': 'Habitación estándar',
            'view-details': 'Ver detalles',
            'amenities': 'Comodidades',
            'price-night': 'Precio por noche',
            
            // Contact
            'contact-us': 'Contáctenos',
            'contact-desc': '¿Tiene preguntas o necesita ayuda para planificar su viaje? ¡Contáctenos!',
            'name': 'Nombre',
            'email': 'Correo electrónico',
            'message': 'Mensaje',
            'send': 'Enviar',
            'your-feedback': 'Su opinión',
            'submit-feedback': 'Enviar opinión',
            
            // AI Assistant
            'travel-assistant': 'Asistente de viaje',
            'ai-welcome': '¡Hola! Soy su asistente de viaje de Sri Lanka. Puedo ayudarle con:',
            'hotel-info': 'Información de hoteles',
            'local-attractions': 'Atracciones locales',
            'travel-tips': 'Consejos de viaje',
            'booking-assistance': 'Ayuda con reservas',
            'how-assist': '¿Cómo puedo ayudarle hoy?',
            'ask-anything': 'Pregúnteme cualquier cosa sobre Sri Lanka...',
            'need-help': '¿Necesita ayuda?'
        },
        'si': {
            'home': 'මුල් පිටුව',
            'transport': 'ප්‍රවාහනය',
            'explore': 'ගවේෂණය',
            'contact': 'සම්බන්ධ වන්න',
            'hero-title': 'හොඳම ගමන - හොඳම තේරීම',
            'hero-subtitle': 'ශ්‍රී ලංකාවේ ඔබේ ප්‍රීමියම් සංචාරක අත්දැකීම',
            'book-transport': 'ප්‍රවාහනය වෙන් කරන්න',
            'explore-lanka': 'ශ්‍රී ලංකාව ගවේෂණය කරන්න',
            'transport-services': 'ප්‍රවාහන සේවා',
            'discover-lanka': 'ශ්‍රී ලංකාව සොයා ගන්න',
            'need-help': 'උදව් අවශ්‍යද?',
            
            // Booking journey
            'book-your-journey': 'ඔබේ ගමන වෙන් කරන්න',
            'deposit-required': 'වෙන් කිරීමේදී 30% තැන්පතුවක් අවශ්‍ය වේ',
            'from': 'සිට',
            'to': 'දක්වා',
            'date': 'දිනය',
            'time': 'වේලාව',
            'passengers': 'මගීන්',
            'vehicle-type': 'වාහන වර්ගය',
            'car': 'මෝටර් රථය',
            'van': 'වෑන් රථය',
            'suv': 'එස්යූවී',
            'bus': 'බස් රථය',
            'get-quote': 'මිල ගණන් ලබා ගන්න',
            'book-now': 'දැන් වෙන් කරන්න',
            
            // Explore section
            'explore-sri-lanka': 'ශ්‍රී ලංකාව ගවේෂණය කරන්න',
            'beaches-title': 'සිහින වෙරළවල්',
            'beaches-desc': 'ශ්‍රී ලංකාවේ වෙරළ තීරය පුරා පැතිර ඇති පැහැපත් ජලය සහ රන්වන් වැලි සහිත වෙරළවල් අත්විඳින්න.',
            'wildlife-title': 'විශිෂ්ට වනජීවීන්',
            'wildlife-desc': 'අලින්, කොටින් සහ වර්ණවත් කුරුල්ලන් සමඟ ජාතික උද්‍යානවල විවිධාකාර වනජීවීන් සොයා ගන්න.',
            'culture-title': 'පොහොසත් සංස්කෘතිය',
            'culture-desc': 'වසර 2500ක පැරණි සංස්කෘතියක්, පන්සල්, නටබුන් සහ සජීවී සම්ප්‍රදායන් තුළට පිවිසෙන්න.',
            'cuisine-title': 'රසවත් ආහාර',
            'cuisine-desc': 'ශ්‍රී ලංකාව සතු කුළුබඩු සහිත කරි, අලුත් මුහුදු ආහාර සහ අපූරු පළතුරු රස බලන්න.',
            
            // Testimonials
            'what-customers-say': 'අපේ ගනුදෙනුකරුවන් කියන දේ',
            'customer-review-1': 'අපේ රියදුරා වේලාවට පැමිණියා, මිත්‍රශීලී වුණා, සහ ස්ථාන ගැන හොඳින් දැනුවත් වුණා. කාරය අපේ දිගු ගමනට ඉතා පහසු වුණා.',
            'customer-name-1': 'කමල් පෙරේරා',
            
            // Accommodation
            'accommodation': 'නවාතැන්',
            'book-hotels': 'හෝටල් වෙන් කරන්න',
            'luxury-room': 'සුපිරි කාමරය',
            'deluxe-room': 'ඩිලක්ස් කාමරය',
            'standard-room': 'සාමාන්‍ය කාමරය',
            'view-details': 'විස්තර බලන්න',
            'amenities': 'පහසුකම්',
            'price-night': 'රාත්‍රියක මිල',
            
            // Contact
            'contact-us': 'අප අමතන්න',
            'contact-desc': 'ඔබේ ගමන සැලසුම් කිරීම සඳහා ප්‍රශ්න හෝ උදව් අවශ්‍යද? අප අමතන්න!',
            'name': 'නම',
            'email': 'ඊමේල්',
            'message': 'පණිවිඩය',
            'send': 'යවන්න',
            'your-feedback': 'ඔබේ ප්‍රතිචාරය',
            'submit-feedback': 'ප්‍රතිචාරය ඉදිරිපත් කරන්න',
            
            // AI Assistant
            'travel-assistant': 'සංචාරක සහායකයා',
            'ai-welcome': 'ආයුබෝවන්! මම ඔබේ ශ්‍රී ලංකා සංචාරක සහායකයා. මට ඔබට උදව් කළ හැක:',
            'hotel-info': 'හෝටල් තොරතුරු',
            'local-attractions': 'ප්‍රදේශයේ ආකර්ෂණීය ස්ථාන',
            'travel-tips': 'සංචාරක ඉඟි',
            'booking-assistance': 'වෙන්කිරීම් සහාය',
            'how-assist': 'අද දින මට ඔබට කෙසේ උදව් කළ හැකිද?',
            'ask-anything': 'ශ්‍රී ලංකාව ගැන ඕනෑම දෙයක් අසන්න...',
            'need-help': 'උදව් අවශ්‍යද?'
        }
    };

    // 3. 初始化 - 等待页面完全加载后运行
    function initPatch() {
        console.log("🔄 初始化语言补丁...");
        
        // 清理页面上的所有额外语言选择器
        cleanupLanguageSelectors();
        
        // 创建正确的语言选择器（在导航栏中创建下拉菜单）
        createNavbarLanguageSelector();
        
        // 初始化当前语言 (从本地存储或默认为英语)
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 强制重新应用翻译，确保整个页面都被翻译
        setTimeout(() => {
            applyTranslation(currentLang, true);
        }, 300);
        
        // 增加data-i18n属性到未标记的元素
        setTimeout(() => {
            addMissingI18nAttributes();
        }, 500);
        
        console.log("✅ 语言补丁初始化完成!");
    }

    // 4. 清除多余语言选择器
    function cleanupLanguageSelectors() {
        console.log("🧹 清理多余的语言选择器...");
        
        // 移除之前创建的任何语言选择器
        const selectorsToRemove = [
            document.getElementById('floating-language-panel'),
            document.getElementById('floating-language-switcher'),
            document.getElementById('language-buttons'),
            document.getElementById('topLanguageSelect')
        ];
        
        selectorsToRemove.forEach(selector => {
            if (selector) {
                selector.remove();
                console.log("删除了语言选择器元素");
            }
        });
        
        // 移除顶部导航栏中下拉菜单
        const navLangSwitch = document.querySelector('.language-switch');
        if (navLangSwitch) {
            // 清空内容，但保留容器
            navLangSwitch.innerHTML = '';
            
            // 如果有select下拉框，将其移除
            const selectElements = navLangSwitch.querySelectorAll('select');
            selectElements.forEach(select => {
                select.remove();
            });
            
            console.log("清空了导航栏语言选择器");
        }
    }
    
    // 5. 在导航栏创建下拉菜单语言选择器
    function createNavbarLanguageSelector() {
        console.log("🔨 创建导航栏语言选择器...");
        
        const navLangSwitch = document.querySelector('.language-switch');
        if (!navLangSwitch) {
            console.error("未找到导航栏语言选择器容器");
            return;
        }
        
        // 创建下拉选择框
        const select = document.createElement('select');
        select.id = 'navLanguageSelect';
        
        // 添加样式
        select.style.cssText = `
            padding: 5px 28px 5px 8px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
            background-repeat: no-repeat;
            background-position: right 5px center;
            cursor: pointer;
            font-size: 14px;
        `;
        
        // 获取当前选择的语言
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 添加选项
        Object.keys(LANGUAGES).forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
            option.selected = (code === currentLang);
            select.appendChild(option);
        });
        
        // 添加事件监听器
        select.addEventListener('change', function() {
            switchLanguage(this.value);
        });
        
        // 添加到导航栏
        navLangSwitch.appendChild(select);
        console.log("✅ 创建了导航栏语言选择器");
    }
    
    // 6. 自动检测和翻译未标记的元素
    function detectAndTranslateUnmarkedElements(lang) {
        console.log("🔍 正在智能检测未标记的元素...");
        
        // 需要特别关注的选择器和对应的翻译键
        const specialElements = [
            { selector: 'h1:contains("Transportdienstleistungen")', key: 'transport-services' },
            { selector: 'h2:contains("预订您的旅程")', key: 'book-your-journey' },
            { selector: 'p:contains("需要支付30%")', key: 'deposit-required' },
            { selector: 'label:contains("服务类型")', key: 'vehicle-type' },
            { selector: 'label:contains("Datum")', key: 'date' },
            { selector: 'label:contains("Zeit")', key: 'time' },
            { selector: 'label:contains("Passagiere")', key: 'passengers' },
            { selector: 'label:contains("接送地点")', key: 'pickup-location' },
            { selector: 'label:contains("目的地")', key: 'destination' },
            { selector: 'label:contains("特殊要求")', key: 'special-requirements' }
        ];
        
        // 实现jQuery-like contains选择器
        specialElements.forEach(item => {
            const selector = item.selector;
            const key = item.key;
            
            // 提取选择器类型和文本
            const match = selector.match(/([a-zA-Z0-9]+):contains\("(.+?)"\)/);
            if (match) {
                const elementType = match[1];
                const textToFind = match[2];
                
                // 查找所有该类型的元素
                const elements = document.querySelectorAll(elementType);
                elements.forEach(el => {
                    if (el.textContent.includes(textToFind)) {
                        console.log(`找到未标记元素: ${el.textContent.trim()}`);
                        
                        // 如果元素没有data-i18n属性，添加它
                        if (!el.hasAttribute('data-i18n')) {
                            el.setAttribute('data-i18n', key);
                            // 保存原始文本
                            el.setAttribute('data-default-text', el.textContent);
                            
                            // 立即应用翻译
                            const translation = getTranslation(key, lang);
                            if (translation) {
                                el.textContent = translation;
                                console.log(`应用翻译: ${key} => ${translation}`);
                            }
                        }
                    }
                });
            }
        });
        
        // 通用规则 - 查找常见的需要翻译但没有标记的元素
        const commonElements = [
            { selector: 'h1, h2, h3, h4, h5, p, label, button', minLength: 2 },
            { selector: 'input[type="submit"], input[type="button"]', attribute: 'value', minLength: 2 },
            { selector: 'input[placeholder]', attribute: 'placeholder', minLength: 4 }
        ];
        
        commonElements.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(el => {
                // 如果已经有data-i18n属性，跳过
                if (el.hasAttribute('data-i18n')) return;
                
                let content = item.attribute ? el.getAttribute(item.attribute) : el.textContent;
                content = content.trim();
                
                // 只处理有实际内容并且长度符合要求的元素
                if (content && content.length >= item.minLength) {
                    // 生成一个唯一的键
                    let key = content.toLowerCase()
                        .replace(/[^a-z0-9]/gi, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')
                        .substring(0, 30);
                    
                    // 检查是否已有相同内容的翻译
                    let existingKey = findExistingTranslationKey(content);
                    if (existingKey) {
                        key = existingKey;
                    }
                    
                    console.log(`自动标记元素: "${content}" => ${key}`);
                    
                    // 添加data-i18n属性
                    el.setAttribute('data-i18n', key);
                    el.setAttribute('data-default-text', content);
                    
                    // 如果存在翻译，立即应用
                    const translation = getTranslation(key, lang);
                    if (translation) {
                        if (item.attribute) {
                            el.setAttribute(item.attribute, translation);
                        } else {
                            el.textContent = translation;
                        }
                    }
                }
            });
        });
        
        console.log("✅ 智能检测和翻译完成");
    }
    
    // 查找已有的翻译键
    function findExistingTranslationKey(content) {
        // 遍历所有语言的所有翻译
        for (const lang in TRANSLATIONS) {
            const translations = TRANSLATIONS[lang];
            for (const key in translations) {
                if (translations[key] === content || key === content) {
                    return key;
                }
            }
        }
        return null;
    }
    
    // 获取特定键和语言的翻译
    function getTranslation(key, lang) {
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            return TRANSLATIONS[lang][key];
        }
        return null;
    }
    
    // 7. 为未标记的元素添加data-i18n属性
    function addMissingI18nAttributes() {
        console.log("🔍 检查未标记的元素并添加data-i18n属性...");
        
        // 查找页面中的主要标题和段落
        const sections = [
            { selector: 'h2.section-title:not([data-i18n])', keyPrefix: 'section-title-' },
            { selector: 'h3:not([data-i18n])', keyPrefix: 'heading-' }, 
            { selector: '.explore-content h3:not([data-i18n])', keyPrefix: 'explore-' },
            { selector: '.explore-content p:not([data-i18n])', keyPrefix: 'explore-desc-' },
            { selector: '.testimonial-content p:not([data-i18n])', keyPrefix: 'testimonial-' },
            { selector: '.author-info p:not([data-i18n])', keyPrefix: 'author-' },
            { selector: '.room-card h3:not([data-i18n])', keyPrefix: 'room-' },
            { selector: '.room-card p:not([data-i18n])', keyPrefix: 'room-desc-' },
            { selector: '.room-details span:not([data-i18n])', keyPrefix: 'room-feature-' },
            { selector: '.btn-secondary:not([data-i18n])', keyPrefix: 'btn-' }
        ];
        
        let addedCount = 0;
        
        // 处理每个选择器
        sections.forEach(section => {
            const elements = document.querySelectorAll(section.selector);
            
            elements.forEach((el, index) => {
                // 创建唯一键名
                const key = `${section.keyPrefix}${index}`;
                
                // 保存原始文本
                const originalText = el.textContent.trim();
                
                // 设置data-i18n属性
                el.setAttribute('data-i18n', key);
                
                // 保存默认英文文本
                el.setAttribute('data-default-text', originalText);
                
                // 尝试翻译此元素
                const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                if (currentLang !== 'en' && TRANSLATIONS[currentLang]) {
                    // 为当前语言添加这个键值对到翻译对象
                    if (!TRANSLATIONS[currentLang][key]) {
                        // 如果我们没有翻译，暂时保留英文
                        // 这里可以根据需要调用在线翻译API
                    }
                }
                
                addedCount++;
            });
        });
        
        console.log(`✅ 添加了 ${addedCount} 个data-i18n属性`);
        
        // 再次应用当前语言翻译
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLang !== 'en') {
            applyTranslation(currentLang, false);
        }
    }
    
    // 8. 切换语言
    function switchLanguage(lang) {
        console.log(`🔄 切换语言到: ${lang}`);
        
        if (!LANGUAGES[lang]) {
            console.error(`不支持的语言: ${lang}`);
            return;
        }
        
        // 保存语言设置
        localStorage.setItem('selectedLanguage', lang);
        
        // 更新导航栏下拉菜单
        const navSelect = document.getElementById('navLanguageSelect');
        if (navSelect) {
            navSelect.value = lang;
        }
        
        // 应用翻译，强制刷新
        applyTranslation(lang, true);
        
        // 显示通知
        showNotification(`已切换到 ${LANGUAGES[lang].flag} ${LANGUAGES[lang].name}`);
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    // 9. 应用翻译
    function applyTranslation(lang, forceRefresh = true) {
        console.log(`🔄 正在应用 ${LANGUAGES[lang].name} 翻译...`);
        
        // 先处理已标记的元素
        const elements = document.querySelectorAll('[data-i18n]');
        let translatedCount = 0;
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            
            // 确保在第一次翻译之前保存原始英文
            if (!el.hasAttribute('data-default-text')) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.setAttribute('data-default-text', el.placeholder);
                } else if (el.tagName === 'OPTION') {
                    el.setAttribute('data-default-text', el.text);
                } else {
                    el.setAttribute('data-default-text', el.textContent);
                }
            }
            
            // 应用翻译
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                // 对于输入元素，设置占位符
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = TRANSLATIONS[lang][key];
                }
                // 对于选择框选项
                else if (el.tagName === 'OPTION') {
                    el.text = TRANSLATIONS[lang][key];
                }
                // 普通元素设置文本内容
                else {
                    el.textContent = TRANSLATIONS[lang][key];
                }
                translatedCount++;
            } else {
                if (forceRefresh) console.log(`⚠️ 未找到翻译: ${key}`);
            }
        });
        
        console.log(`✅ 翻译了 ${translatedCount} 个元素`);
        
        // 在处理完标记元素后，检测并翻译未标记元素
        detectAndTranslateUnmarkedElements(lang);
        
        // 强制重绘以确保所有内容更新
        if (forceRefresh) {
            document.body.style.opacity = '0.99';
            setTimeout(() => { 
                document.body.style.opacity = '1';
                // 二次尝试翻译，处理动态加载的元素
                setTimeout(() => {
                    const secondElements = document.querySelectorAll('[data-i18n]');
                    if (secondElements.length > elements.length) {
                        console.log(`发现 ${secondElements.length - elements.length} 个新元素，重新应用翻译`);
                        applyTranslation(lang, false);
                    }
                }, 200);
            }, 50);
        }
    }
    
    // 10. 重置为英文
    function resetToEnglish() {
        console.log("🔄 重置为英文原文...");
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        
        // 恢复原始英文内容
        elements.forEach(el => {
            // 获取默认的英文文本（存储在 data-default-text 属性中）
            const defaultText = el.getAttribute('data-default-text');
            
            if (defaultText) {
                // 如果有存储的默认文本，使用它
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = defaultText;
                } else if (el.tagName === 'OPTION') {
                    el.text = defaultText;
                } else {
                    el.textContent = defaultText;
                }
            }
        });
        
        console.log("✅ 已重置为英文原文");
        
        // 强制重绘
        document.body.style.opacity = '0.99';
        setTimeout(() => { document.body.style.opacity = '1'; }, 50);
    }
    
    // 11. 显示通知
    function showNotification(message) {
        // 创建或获取通知元素
        let notification = document.getElementById('language-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'language-notification';
            notification.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-size: 14px;
            `;
            document.body.appendChild(notification);
        }
        
        // 显示消息
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }
    
    // 12. 导出全局函数
    window.switchLanguage = switchLanguage;
    
    // 13. 启动补丁
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPatch);
    } else {
        // 页面已加载，立即执行
        initPatch();
        
        // 500ms后再执行一次，确保翻译应用到所有元素
        setTimeout(initPatch, 500);
    }
    
    // 14. 定期检查DOM变化并应用当前语言
    setInterval(() => {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLang !== 'en') {
            // 重新应用当前非英语语言，不需要强制刷新
            applyTranslation(currentLang, false);
        }
    }, 2000);

    console.log("🔌 语言补丁已加载，等待初始化...");
})(); 