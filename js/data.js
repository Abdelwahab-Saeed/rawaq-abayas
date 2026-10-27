/* =========================================================
   رواق — بيانات المتجر (المنتجات، التصنيفات، الشحن، الكوبونات)
   لتغيير صورة: استبدلي معرّف الصورة في PHOTOS أو ضعي رابطًا كاملًا.
   ========================================================= */

/* معرّفات صور Unsplash (يمكن استبدال أي قيمة برابط صورة كامل) */
const PHOTOS = {
  // عبايات واسعة (كل الموديلات محجبات)
  goldTrim: '1724412665971-114bd351a42d',
  carpet: '1735559002168-c8d261c86d93',
  sunset: '1682195721373-93bf6c181938',
  khimarBench: '1627378228978-a62f71edff15',
  lavenderPark: '1733217854160-d76db1a19e48',
  navyEmb: '1773991188360-87e01a338cbc',
  navyKhimar: '1730454626266-e6d47134c044',
  blueKhimar: '1730454752575-88d6307f5579',
  purpleNiqab: '1729201025889-9d2a20fd5afd',
  blackGarden: '1544059529-9a9a0a4ef94f',
  blackGrass: '1630735988694-12186aedd73d',
  blackDark: '1613048605431-6057d1b3b40d',
  greenGold: '1649819697232-e9a257444192',
  greenKhimar: '1601209152438-dfbb855b7227',
  greenKhimar2: '1601209150516-4855211d6a64',
  tilesCoat: '1602284619617-dad1a18617ad',
  mustardCoat: '1681152299027-17efe7da7081',
  floralFlowy: '1790689339658-7499933d595e',
  floralDuo: '1758539197931-ef90ca4a3c5e',
  floralDress: '1599521568774-105d691c8206',
  floralChador: '1646935974635-a869d5d7baa3',
  // لقطات تفاصيل (بدون وجه)
  embLeaf: '1772474500365-c2c520545f44',
  pearl: '1772474578035-bebcd90b355d',
  beigeBelt: '1760083545495-b297b1690672',
  // طرح
  scarfWhite: '1585728748176-455ac5eed962',
  hijabBeige: '1619545307432-9fc73f8135ff',
  hijabMocha: '1619545010907-ca2217d296ce',
  hijabPeach: '1640154852340-9de73a0643a8',
  hijabGrey: '1613611927458-3ddd4b0afdb9',
  creamHijab: '1545266241-3516e2a6e016',
  pinkHijab: '1626497361649-81cc097e9bfd',
  // خامات
  silkCream: '1606259457945-67dc66271ee6',
  silkWhite: '1619043518800-7f14be467dca',
  satinBlack: '1637750586228-179a1a7aef84',
  silkGold: '1618434958571-459c9c972ae8',
  chiffon: '1732869415090-179de017b6d6',
  satinPeach: '1613087088715-4b613e9b4d68'
};

/* يبني رابط الصورة بالعرض المطلوب */
function img(key, w = 900) {
  const id = PHOTOS[key] || key;
  if (/^https?:/.test(id)) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;
}

const CATEGORIES = [
  { id: 'embroidered', label: 'مطرزة وسهرات', short: 'السهرات', desc: 'تطريز يدوي ولمسات لؤلؤ لليالي التي لا تُنسى', image: 'goldTrim' },
  { id: 'classic', label: 'كلاسيك سوداء', short: 'الكلاسيك', desc: 'الأسود كما يجب أن يكون: نقي، هادئ، وحاضر', image: 'blackGarden' },
  { id: 'kimono', label: 'كيمونو وكفتان', short: 'الكفتان', desc: 'نقوش وألوان الموسم بانسيابية تامة', image: 'floralFlowy' },
  { id: 'daily', label: 'عبايات يومية', short: 'اليومية', desc: 'راحة تامة بقصّات واسعة لكل يوم', image: 'lavenderPark' },
  { id: 'scarves', label: 'طرح وإكسسوارات', short: 'الطرح', desc: 'التفاصيل التي تُكمل الإطلالة', image: 'hijabBeige' }
];

const FABRICS = {
  crepe: { label: 'كريب', note: 'سقوط ثقيل ومطفي لا يتجعد', image: 'satinBlack' },
  chiffon: { label: 'شيفون', note: 'خفيف وشفاف بطبقات ناعمة', image: 'chiffon' },
  silk: { label: 'حرير', note: 'لمعة دافئة وملمس بارد على البشرة', image: 'silkGold' },
  satin: { label: 'ساتان', note: 'بريق هادئ للأمسيات والمناسبات', image: 'silkCream' },
  linen: { label: 'لينن', note: 'خامة طبيعية تتنفس لأيام الصيف', image: 'silkWhite' }
};

const OCCASIONS = { daily: 'يومي', work: 'عمل', evening: 'سهرة', event: 'مناسبات' };

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const LENGTHS = [52, 54, 56, 58, 60];
const ABAYA_LENGTHS = LENGTHS;

const COLOR_SWATCHES = [
  { name: 'أسود', hex: '#0d0c0b' },
  { name: 'بيج', hex: '#cdb89b' },
  { name: 'رمادي', hex: '#9a958c' },
  { name: 'كحلي', hex: '#1f2a44' },
  { name: 'موكا', hex: '#7b5e4b' },
  { name: 'أخضر', hex: '#2f4a3a' },
  { name: 'أبيض', hex: '#efe9df' },
  { name: 'وردي', hex: '#c99a8e' },
  { name: 'بنفسجي', hex: '#5a4766' }
];

/* =========================================================
   المنتجات
   colors: [{ name, hex, images: [مفاتيح صور] }]
   tags: featured | new | sale | signature
   ========================================================= */
const PRODUCTS = [
  {
    id: 1, name: 'عباية سَديم المطرزة', cat: 'embroidered', price: 3850, oldPrice: null,
    fabric: 'crepe', occasion: 'evening', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['embLeaf', 'blackGarden', 'satinBlack'] }
    ],
    stock: 4, rating: 4.9, reviews: 38, tags: ['featured', 'signature', 'new'],
    desc: 'عباية كريب فاخرة بتطريز أوراق فضية يدوي ينساب على الصدر والأكمام، بأساور دانتيل ناعمة تمنح الإطلالة حضورًا لا يُنسى.',
    details: ['كريب ياباني ثقيل', 'تطريز يدوي بخيوط فضية', 'أكمام بأساور دانتيل', 'تُرتدى مفتوحة أو مغلقة']
  },
  {
    id: 2, name: 'عباية لؤلؤة', cat: 'embroidered', price: 4200, oldPrice: 4800,
    fabric: 'crepe', occasion: 'event', sizes: ['XS', 'S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['pearl', 'blackDark', 'satinBlack'] }
    ],
    stock: 3, rating: 4.8, reviews: 52, tags: ['signature', 'sale', 'featured'],
    desc: 'حواف مرصعة بحبات لؤلؤ وخرز مصفوفة يدويًا على طول الفتحة الأمامية والأكمام. القطعة التي تُعرّف بكِ قبل أن تتكلمي.',
    details: ['أكثر من 600 حبة لؤلؤ مثبتة يدويًا', 'بطانة داخلية خفيفة', 'فتحة أمامية مع أزرار مخفية', 'تأتي في علبة هدايا رواق']
  },
  {
    id: 3, name: 'عباية ذهب الليل', cat: 'embroidered', price: 3600, oldPrice: null,
    fabric: 'crepe', occasion: 'evening', sizes: ['S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود ذهبي', hex: '#b8955a', images: ['goldTrim', 'embLeaf', 'silkGold'] }
    ],
    stock: 7, rating: 4.9, reviews: 64, tags: ['featured', 'signature'],
    desc: 'شريط تطريز ذهبي عتيق يحدد الفتحة والأكمام على قماش كريب أسود عميق. فخامة شرقية بلغة معاصرة.',
    details: ['شريط تطريز معدني ذهبي', 'قصّة مستقيمة بانسدال كامل', 'حزام داخلي اختياري', 'مناسبة للأفراح والسهرات']
  },
  {
    id: 4, name: 'عباية ياسمين', cat: 'embroidered', price: 3250, oldPrice: null,
    fabric: 'crepe', occasion: 'event', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أخضر زيتي', hex: '#2f4a3a', images: ['greenGold', 'satinBlack'] }
    ],
    stock: 9, rating: 4.7, reviews: 29, tags: ['new', 'featured'],
    desc: 'سلاسل ذهبية ناعمة تزيّن الكتفين على قماش أخضر زيتي عميق، بقصّة واسعة تتحرك معكِ بخفة.',
    details: ['سلاسل ذهبية على الكتفين', 'أكمام واسعة', 'خامة لا تتجعد', 'غسيل يدوي لطيف']
  },
  {
    id: 5, name: 'عباية نُوْر', cat: 'embroidered', price: 3950, oldPrice: null,
    fabric: 'satin', occasion: 'event', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'كحلي × ذهبي', hex: '#1f2a44', images: ['navyEmb', 'satinBlack'] }
    ],
    stock: 2, rating: 5, reviews: 17, tags: ['signature', 'new'],
    desc: 'عباية كحلية واسعة بتطريز ذهبي عريض حول الياقة والأطراف. حضور ملكي بلمسة دافئة تخطف الأنظار.',
    details: ['تطريز ذهبي عريض', 'قصّة واسعة مستقيمة', 'ساتان مطفي ناعم', 'إصدار محدود']
  },
  {
    id: 6, name: 'عباية مَدار', cat: 'classic', price: 2450, oldPrice: null,
    fabric: 'crepe', occasion: 'work', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['blackGarden', 'blackGrass'] }
    ],
    stock: 14, rating: 4.8, reviews: 91, tags: ['featured'],
    desc: 'العباية السوداء الواسعة التي تحتاجها كل خزانة. قصّة مستقيمة نظيفة تُنسّق مع طرحة سوداء لإطلالة كاملة الهدوء.',
    details: ['كريب مطفي متوسط الوزن', 'قصّة واسعة مريحة', 'جيوب جانبية مخفية', 'مناسبة للعمل والخروج']
  },
  {
    id: 7, name: 'طقم خمار سَكينة', cat: 'classic', price: 2650, oldPrice: null,
    fabric: 'crepe', occasion: 'daily', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['khimarBench', 'blackDark'] }
    ],
    stock: 11, rating: 4.6, reviews: 34, tags: ['new'],
    desc: 'خمار طويل بطبقة واحدة مع عباية واسعة من نفس القماش. ستر كامل وراحة تامة في الحركة.',
    details: ['خمار يغطي حتى الركبة', 'عباية واسعة مدمجة', 'قماش نيدا خفيف', 'غسيل آلي على درجة منخفضة']
  },
  {
    id: 8, name: 'عباية فراشة', cat: 'classic', price: 2350, oldPrice: 2750,
    fabric: 'crepe', occasion: 'daily', sizes: ['S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['blackGrass', 'blackGarden'] }
    ],
    stock: 6, rating: 4.7, reviews: 46, tags: ['sale', 'featured'],
    desc: 'قصّة فراشة واسعة جدًا تمنح حرية في الحركة. مريحة لأقصى درجة وأنيقة في كل جلسة.',
    details: ['أكمام فراشة', 'بدون خصر محدد', 'مقاس واسع مريح', 'خامة خفيفة']
  },
  {
    id: 9, name: 'عباية وَقار', cat: 'classic', price: 2200, oldPrice: null,
    fabric: 'linen', occasion: 'daily', sizes: ['M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود', hex: '#0d0c0b', images: ['carpet', 'sunset'] }
    ],
    stock: 18, rating: 4.6, reviews: 58, tags: [],
    desc: 'تطريز هندسي ناعم على الأكمام وقماش لينن يتنفس. رفيقتكِ للأيام الطويلة.',
    details: ['مزيج لينن وفسكوز', 'تطريز هندسي على الكم', 'قصّة مريحة', 'مثالية للصيف']
  },
  {
    id: 10, name: 'عباية سُكون', cat: 'daily', price: 1650, oldPrice: null,
    fabric: 'crepe', occasion: 'daily', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أخضر زيتي', hex: '#2f4a3a', images: ['greenKhimar', 'greenKhimar2'] },
      { name: 'أسود', hex: '#0d0c0b', images: ['blackDark', 'blackGarden'] }
    ],
    stock: 22, rating: 4.7, reviews: 112, tags: ['featured'],
    desc: 'عباية يومية واسعة بقصّة مستقيمة وأكمام مريحة، تتناغم مع الخمار الملوّن. الأكثر مبيعًا في رواق لسبب واضح.',
    details: ['قصّة واسعة مستقيمة', 'أكمام بأساور مطاطية', 'خامة لا تحتاج كيّ', 'متوفرة بلونين']
  },
  {
    id: 11, name: 'عباية رِمال', cat: 'daily', price: 1850, oldPrice: null,
    fabric: 'linen', occasion: 'work', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'بيج', hex: '#cdb89b', images: ['beigeBelt', 'tilesCoat'] }
    ],
    stock: 10, rating: 4.8, reviews: 41, tags: ['new', 'featured'],
    desc: 'درجة الرمل الدافئة بقصّة محددة بحزام رفيع وطيّات ناعمة عند الأطراف. هادئة وراقية.',
    details: ['حزام رفيع قابل للفك', 'طيّات عند الأطراف', 'لينن ناعم', 'مناسبة للعمل']
  },
  {
    id: 12, name: 'عباية ضباب', cat: 'daily', price: 1750, oldPrice: 2100,
    fabric: 'crepe', occasion: 'daily', sizes: ['S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'لافندر رمادي', hex: '#a9a3c4', images: ['lavenderPark', 'silkWhite'] }
    ],
    stock: 8, rating: 4.6, reviews: 27, tags: ['sale'],
    desc: 'طقم واسع بدرجة اللافندر الرمادية الناعمة: تونيك طويل فوق تنورة واسعة. لون هادئ ينسجم مع كل شيء.',
    details: ['تونيك طويل وتنورة واسعة', 'أكمام واسعة', 'كريب خفيف', 'لون محايد للتنسيق']
  },
  {
    id: 13, name: 'عباية خمار نيلي', cat: 'daily', price: 1950, oldPrice: null,
    fabric: 'satin', occasion: 'work', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'كحلي نيلي', hex: '#2c3550', images: ['navyKhimar', 'blueKhimar'] }
    ],
    stock: 12, rating: 4.7, reviews: 33, tags: ['featured', 'new'],
    desc: 'خمار طويل وعباية واسعة جدًا بلون النيلي العميق. ستر كامل وراحة تامة طوال اليوم.',
    details: ['خمار طويل مدمج', 'قصّة واسعة جدًا', 'قماش نيدا خفيف', 'لا يحتاج كيّ']
  },
  {
    id: 14, name: 'كيمونو كراميل', cat: 'kimono', price: 2850, oldPrice: null,
    fabric: 'crepe', occasion: 'work', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'كراميل', hex: '#a8682e', images: ['mustardCoat', 'silkGold'] }
    ],
    stock: 5, rating: 4.9, reviews: 48, tags: ['featured', 'new', 'signature'],
    desc: 'كيمونو طويل بلون الكراميل يُرتدى مفتوحًا فوق فستان عاجي. تنسيق ألوان دافئ وقصّة حادة الخطوط.',
    details: ['كراميل دافئ', 'يُرتدى فوق أي طقم', 'جيوب جانبية', 'كريب ثقيل']
  },
  {
    id: 15, name: 'كفتان زهور الربيع', cat: 'kimono', price: 3100, oldPrice: null,
    fabric: 'chiffon', occasion: 'event', sizes: ['XS', 'S', 'M', 'L'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'وردي مزهر', hex: '#d9a3a8', images: ['floralFlowy', 'floralDuo'] }
    ],
    stock: 4, rating: 4.8, reviews: 22, tags: ['new'],
    desc: 'كفتان شيفون مزهر بطبقات تتطاير مع النسيم، واسع ومريح. اختيار مثالي للخطوبة والنهارات المميزة.',
    details: ['شيفون مطبوع', 'بطانة كاملة', 'أكمام طويلة واسعة', 'إصدار محدود']
  },
  {
    id: 16, name: 'كيمونو قَنطرة', cat: 'kimono', price: 2950, oldPrice: null,
    fabric: 'linen', occasion: 'work', sizes: ['S', 'M', 'L', 'XL', 'XXL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'بيج', hex: '#cdb89b', images: ['tilesCoat', 'silkCream'] }
    ],
    stock: 9, rating: 4.7, reviews: 19, tags: [],
    desc: 'كيمونو طويل بياقة شال عريضة وحزام، بدرجات محايدة تتماشى مع إطلالات النهار.',
    details: ['ياقة شال', 'حزام قابل للفك', 'لينن مغسول', 'أكمام واسعة']
  },
  {
    id: 17, name: 'كفتان الحديقة', cat: 'kimono', price: 3400, oldPrice: 3900,
    fabric: 'satin', occasion: 'evening', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أبيض مزهر', hex: '#e8e2ea', images: ['floralDuo', 'floralDress'] }
    ],
    stock: 3, rating: 4.9, reviews: 26, tags: ['sale', 'signature'],
    desc: 'كفتان واسع بنقشة زهور ناعمة على أرضية عاجية وأكمام منفوخة. خفيف وأنيق لنزهات النهار والعزومات.',
    details: ['قطن مطبوع ناعم', 'حزام عند الخصر', 'أكمام منفوخة', 'بطانة خفيفة']
  },
  {
    id: 18, name: 'عباية زهور الليل', cat: 'kimono', price: 3300, oldPrice: null,
    fabric: 'satin', occasion: 'evening', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'أسود مزهر', hex: '#2a2622', images: ['floralChador', 'satinBlack'] }
    ],
    stock: 6, rating: 4.8, reviews: 15, tags: ['new'],
    desc: 'عباية واسعة بنقشة زهور صغيرة على أرضية سوداء مع طرحة من نفس القماش. فخامة شرقية بروح يومية.',
    details: ['طرحة مطابقة', 'قصّة واسعة', 'ڤيسكوز ناعم', 'أكمام طويلة']
  },
  {
    id: 19, name: 'طرحة شيفون رمل', cat: 'scarves', price: 280, oldPrice: null,
    fabric: 'chiffon', occasion: 'daily', sizes: ['ONE'], lengths: [],
    colors: [
      { name: 'بيج', hex: '#cdb89b', images: ['hijabBeige', 'creamHijab'] }
    ],
    stock: 40, rating: 4.8, reviews: 140, tags: ['featured'],
    desc: 'طرحة شيفون ناعمة لا تنزلق، بلون الرمل الذي ينسجم مع كل عباية في رواق.',
    details: ['شيفون جورجيت', 'مقاس 180 × 70 سم', 'حواف مخيطة يدويًا', 'لا تحتاج دبابيس كثيرة']
  },
  {
    id: 20, name: 'طرحة موكا', cat: 'scarves', price: 260, oldPrice: null,
    fabric: 'chiffon', occasion: 'daily', sizes: ['ONE'], lengths: [],
    colors: [{ name: 'موكا', hex: '#7b5e4b', images: ['hijabMocha', 'satinPeach'] }],
    stock: 35, rating: 4.7, reviews: 88, tags: ['new'],
    desc: 'لون الموكا الدافئ بخامة مطفية تمسك الشكل طوال اليوم.',
    details: ['جيرسيه مطفي', 'مقاس 180 × 70 سم', 'لا يتجعد', 'غسيل آلي']
  },
  {
    id: 21, name: 'شال حرير مطبوع', cat: 'scarves', price: 420, oldPrice: null,
    fabric: 'silk', occasion: 'event', sizes: ['ONE'], lengths: [],
    colors: [
      { name: 'أبيض × أسود', hex: '#efe9df', images: ['scarfWhite', 'creamHijab'] }
    ],
    stock: 15, rating: 4.9, reviews: 54, tags: ['featured'],
    desc: 'شال حرير بطبعة جلد الثعبان الناعمة. لمسة جريئة تكمل العباية السادة.',
    details: ['حرير طبيعي 100%', 'مقاس 180 × 90 سم', 'حواف ملفوفة يدويًا', 'تنظيف جاف']
  },
  {
    id: 22, name: 'طرحة خوخي', cat: 'scarves', price: 260, oldPrice: 320,
    fabric: 'chiffon', occasion: 'daily', sizes: ['ONE'], lengths: [],
    colors: [
      { name: 'خوخي', hex: '#c99a8e', images: ['hijabPeach', 'pinkHijab'] }
    ],
    stock: 20, rating: 4.6, reviews: 61, tags: ['sale'],
    desc: 'درجة الخوخ الناعمة التي تضيء الوجه، بخامة خفيفة لأيام الصيف.',
    details: ['شيفون خفيف', 'مقاس 180 × 70 سم', 'لون ثابت', 'غسيل يدوي']
  },
  {
    id: 23, name: 'طرحة رمادي حجري', cat: 'scarves', price: 260, oldPrice: null,
    fabric: 'chiffon', occasion: 'daily', sizes: ['ONE'], lengths: [],
    colors: [{ name: 'رمادي', hex: '#9a958c', images: ['hijabGrey', 'silkWhite'] }],
    stock: 25, rating: 4.7, reviews: 47, tags: [],
    desc: 'رمادي حجري محايد للأيام العملية، يتناغم مع العبايات السوداء والكحلية.',
    details: ['جيرسيه ناعم', 'مقاس 180 × 70 سم', 'لا يتجعد', 'غسيل آلي']
  },
  {
    id: 24, name: 'عباية أُمسية', cat: 'embroidered', price: 3750, oldPrice: null,
    fabric: 'crepe', occasion: 'evening', sizes: ['S', 'M', 'L', 'XL'], lengths: ABAYA_LENGTHS,
    colors: [
      { name: 'بنفسجي', hex: '#5a4766', images: ['purpleNiqab', 'silkGold'] }
    ],
    stock: 5, rating: 4.8, reviews: 23, tags: ['signature'],
    desc: 'عباية بنفسجية واسعة مع طرحة طويلة من نفس اللون وحبات لؤلؤ صغيرة. فخامة هامسة لمن يعرفن.',
    details: ['طرحة طويلة مطابقة', 'حبات لؤلؤ يدوية', 'كريب ثقيل', 'قصّة واسعة']
  }
];

/* آراء العملاء (تُوزع على المنتجات) */
const SEED_REVIEWS = [
  { name: 'منة الله ع.', city: 'القاهرة', rating: 5, text: 'الخامة أحلى من الصور بكتير، والتطريز متقن جدًا. التغليف نفسه كان هدية.' },
  { name: 'سارة م.', city: 'الإسكندرية', rating: 5, text: 'المقاس مظبوط بالظبط حسب الدليل، والطول 56 كان مثالي لطولي 165.' },
  { name: 'نورهان ك.', city: 'الجيزة', rating: 4, text: 'جميلة جدًا وراقية، الشحن اتأخر يوم بس خدمة العملاء كانوا متعاونين جدًا.' },
  { name: 'ريم ح.', city: 'المنصورة', rating: 5, text: 'تاني مرة أطلب من رواق. الكريب تقيل ومبيتكرمش خالص.' },
  { name: 'هبة س.', city: 'طنطا', rating: 5, text: 'لبستها في فرح أختي وكل الناس سألتني جايباها منين.' },
  { name: 'دينا ف.', city: 'أسيوط', rating: 4, text: 'لون مظبوط زي الصورة، وقصّة مريحة جدًا في الحركة.' }
];

const TESTIMONIALS = [
  { name: 'ملك الشريف', role: 'عميلة منذ 2024', text: 'أول مرة ألاقي عباية سوداء بسيطة بس فيها حضور بالشكل ده. رواق فهموا يعني إيه فخامة هادية.', product: 'عباية مَدار' },
  { name: 'ياسمين عادل', role: 'عروس 2026', text: 'اخترت عباية لؤلؤة لحفلة الحنة، التفاصيل خطفت عيون الكل. التغليف والكارت المكتوب بخط اليد لمسة مش هنساها.', product: 'عباية لؤلؤة' },
  { name: 'د. رحاب منصور', role: 'طبيبة', text: 'محتاجة عباية واسعة وعملية لشغلي ومش عايزة أتنازل عن الشكل. سُكون بقت أساسية في دولابي بلونين.', product: 'عباية سُكون' },
  { name: 'فرح النجار', role: 'مصممة ديكور', text: 'الكيمونو الكراميل تحفة، الخطوط حادة والقماش تقيل. بلبسه فوق أي طقم وبيغير الإطلالة كلها.', product: 'كيمونو كراميل' }
];

/* المحافظات ومناطق الشحن */
const SHIPPING_ZONES = {
  metro: { label: 'القاهرة الكبرى', fee: 60, days: '1–2' },
  delta: { label: 'الدلتا والإسكندرية والقناة', fee: 75, days: '2–3' },
  upper: { label: 'الصعيد', fee: 90, days: '3–4' },
  remote: { label: 'المحافظات الحدودية', fee: 120, days: '4–6' }
};
const GOVERNORATES = [
  ['القاهرة', 'metro'], ['الجيزة', 'metro'], ['القليوبية', 'metro'],
  ['الإسكندرية', 'delta'], ['البحيرة', 'delta'], ['الدقهلية', 'delta'], ['الغربية', 'delta'],
  ['المنوفية', 'delta'], ['الشرقية', 'delta'], ['كفر الشيخ', 'delta'], ['دمياط', 'delta'],
  ['بورسعيد', 'delta'], ['الإسماعيلية', 'delta'], ['السويس', 'delta'],
  ['الفيوم', 'upper'], ['بني سويف', 'upper'], ['المنيا', 'upper'], ['أسيوط', 'upper'],
  ['سوهاج', 'upper'], ['قنا', 'upper'], ['الأقصر', 'upper'], ['أسوان', 'upper'],
  ['البحر الأحمر', 'remote'], ['مطروح', 'remote'], ['الوادي الجديد', 'remote'],
  ['شمال سيناء', 'remote'], ['جنوب سيناء', 'remote']
];
const FREE_SHIPPING_MIN = 2000;

/* أكواد الخصم التجريبية */
const COUPONS = {
  RAWAQ10: { type: 'percent', value: 10, min: 0, label: 'خصم 10% على طلبك' },
  WELCOME15: { type: 'percent', value: 15, min: 1500, label: 'خصم 15% للطلبات فوق 1500 ج.م' },
  VIP200: { type: 'fixed', value: 200, min: 2500, label: 'خصم 200 ج.م للطلبات فوق 2500 ج.م' }
};

const ORDER_STEPS = [
  { key: 'placed', label: 'تم استلام الطلب', note: 'وصلنا طلبك وجارٍ مراجعته' },
  { key: 'prep', label: 'قيد التجهيز', note: 'نجهّز قطعتك ونغلفها بعناية' },
  { key: 'shipped', label: 'تم الشحن', note: 'سُلّم الطلب لشركة الشحن' },
  { key: 'out', label: 'خرج للتوصيل', note: 'المندوب في طريقه إليكِ' },
  { key: 'delivered', label: 'تم التسليم', note: 'نتمنى أن تنال القطعة إعجابك' }
];

const STORE_INFO = {
  whatsapp: '201000000000',
  phone: '+20 100 000 0000',
  email: 'hello@rawaq.store',
  instagram: '@rawaq.women',
  address: 'الزمالك، القاهرة'
};
