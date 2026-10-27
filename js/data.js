/* =========================================================
   شَهد — بيانات المتجر (الأصناف، الأقسام، الأوزان، الشحن، الكوبونات)
   لتغيير صورة: ضع رابط صورة كاملًا مكان اسم الصورة في PHOTOS،
   أو استبدل الملف بنفس الاسم داخل assets/sweets/.
   ========================================================= */

/* الصور: الاسم ← ملف داخل assets/sweets أو رابط كامل */
const PHOTOS = {
  // مثال لاستخدام صورة حقيقية:
  // 'konafa-cream': 'https://example.com/my-konafa.jpg',
};

/* يرجّع رابط الصورة (العرض w محفوظ للتوافق مع الصور الخارجية) */
function img(key, w = 900) {
  const src = PHOTOS[key] || key;
  if (/^(https?:|data:|\.?\/|assets\/)/.test(src)) return src;
  return `assets/sweets/${src}.svg`;
}

const CATEGORIES = [
  { id: 'konafa', label: 'كنافة وقطايف', short: 'الكنافة', desc: 'كنافة بلدي مقرمشة بالسمن، بالقشطة والنوتيلا والمانجو', image: 'konafa-cream' },
  { id: 'basbousa', label: 'بسبوسة وهريسة', short: 'البسبوسة', desc: 'بسبوسة طرية بالسمن البلدي والشربات الخفيف', image: 'basbousa' },
  { id: 'baklava', label: 'بقلاوة وجلاش', short: 'البقلاوة', desc: 'رقائق ذهبية بالفستق الحلبي والمكسرات', image: 'baklava' },
  { id: 'kahk', label: 'كحك ومعمول وبسكويت', short: 'المخبوزات', desc: 'طعم العيد في كل يوم، بالسمن والسكر البودرة', image: 'kahk' },
  { id: 'cakes', label: 'تورت وحلويات غربي', short: 'التورت', desc: 'تورت وتشيز كيك وجاتوه لكل احتفال', image: 'cake-strawberry' },
  { id: 'cups', label: 'كاسات وحلويات سريعة', short: 'الكاسات', desc: 'أم علي، أرز بلبن، مهلبية وزلابية سخنة', image: 'mahalabia' }
];

/* المكوّن الأساسي (يظهر في قسم «من المكوّن إلى الطبق» وفي الفلاتر) */
const FLAVORS = {
  ghee: { label: 'سمن بلدي', note: 'سمن بلدي أصلي يدّي الحلويات ريحة البيت وطعم زمان', image: 'basbousa-2' },
  cream: { label: 'قشطة', note: 'قشطة طازة بتتعمل كل يوم الصبح، ناعمة وخفيفة', image: 'konafa-cream-2' },
  pistachio: { label: 'فستق حلبي', note: 'فستق حلبي مقشّر ومحمّص على خفيف، أخضر ولامع', image: 'baklava-2' },
  nuts: { label: 'مكسرات وعسل', note: 'عين جمل ولوز وبندق مع عسل نحل طبيعي', image: 'nest-2' },
  chocolate: { label: 'شوكولاتة', note: 'شوكولاتة بلجيكي ونوتيلا للي بيحبوا الطعم الغني', image: 'cake-chocolate-2' }
};

const OCCASIONS = { daily: 'تحلية يومية', guests: 'عزومة', ramadan: 'رمضان والعيد', gift: 'هدايا' };

/* الأوزان والأحجام: factor = مضاعف السعر الأساسي */
const SIZE_OPTIONS = {
  q: { label: 'ربع كيلو', factor: 0.25 },
  h: { label: 'نص كيلو', factor: 0.5 },
  k: { label: 'كيلو', factor: 1 },
  s: { label: 'صغيرة · 6 أفراد', factor: 1 },
  m: { label: 'وسط · 10 أفراد', factor: 1.6 },
  l: { label: 'كبيرة · 16 فرد', factor: 2.3 },
  box6: { label: 'علبة 6 قطع', factor: 1 },
  box12: { label: 'علبة 12 قطعة', factor: 1.9 },
  c1: { label: 'كاسة واحدة', factor: 1 },
  c4: { label: 'علبة 4 كاسات', factor: 3.6 },
  sm: { label: 'علبة صغيرة', factor: 1 },
  lg: { label: 'علبة كبيرة', factor: 1.8 }
};
const KILO = ['q', 'h', 'k'];
const CAKE = ['s', 'm', 'l'];

/* =========================================================
   الأصناف
   variants: [{ name, hex, images: [أسماء صور] }] — أنواع/نكهات الصنف
   price: سعر الحجم الأساسي (factor = 1)، unit: وحدة السعر المعروضة
   tags: featured | new | sale | signature
   ========================================================= */
const PRODUCTS = [
  {
    id: 1, name: 'كنافة بالقشطة', cat: 'konafa', price: 420, oldPrice: null, unit: 'الكيلو',
    flavor: 'cream', occasion: 'guests', sizes: KILO,
    variants: [
      { name: 'بالقشطة', hex: '#fff3dc', images: ['konafa-cream', 'konafa-cream-2'] },
      { name: 'بالمانجو والقشطة', hex: '#ffc233', images: ['konafa-mango', 'konafa-mango-2'] }
    ],
    stock: 14, rating: 4.9, reviews: 212, tags: ['featured', 'signature'],
    desc: 'كنافة بلدي محمّرة بالسمن ومحشية قشطة طازة، عليها شربات خفيف وفستق مجروش. الصنف اللي بيخلص أول واحد في كل عزومة.',
    details: ['كنافة بلدي يدوي', 'قشطة طازة من نفس اليوم', 'شربات خفيف على الجنب', 'تتسخن 5 دقايق في الفرن']
  },
  {
    id: 2, name: 'كنافة نوتيلا', cat: 'konafa', price: 520, oldPrice: null, unit: 'الكيلو',
    flavor: 'chocolate', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'نوتيلا وبندق', hex: '#6b3a22', images: ['konafa-nutella', 'konafa-nutella-2'] }],
    stock: 9, rating: 4.8, reviews: 140, tags: ['new', 'featured'],
    desc: 'كنافة مقرمشة محشية نوتيلا سايحة ومزيّنة بالبندق المحمّص. للي بيحبوا الشوكولاتة في كل حاجة.',
    details: ['نوتيلا أصلية', 'بندق محمّص', 'من غير شربات تقيل', 'أحلى وهي سخنة']
  },
  {
    id: 3, name: 'كنافة بالفستق الحلبي', cat: 'konafa', price: 680, oldPrice: null, unit: 'الكيلو',
    flavor: 'pistachio', occasion: 'gift', sizes: KILO,
    variants: [{ name: 'فستق حلبي', hex: '#8cbf4d', images: ['konafa-pistachio', 'konafa-pistachio-2'] }],
    stock: 4, rating: 5, reviews: 76, tags: ['signature', 'new'],
    desc: 'كنافة ناعمة متغطية بالكامل بطبقة فستق حلبي مجروش، وفي النص قلب قشطة. صنف التوقيع بتاعنا.',
    details: ['فستق حلبي فاخر', 'قلب قشطة', 'كمية محدودة يوميًا', 'مناسبة للهدايا']
  },
  {
    id: 4, name: 'قطايف رمضان', cat: 'konafa', price: 360, oldPrice: null, unit: 'الكيلو',
    flavor: 'nuts', occasion: 'ramadan', sizes: KILO,
    variants: [
      { name: 'بالمكسرات', hex: '#b07a45', images: ['qatayef-nuts', 'qatayef-nuts-2'] },
      { name: 'بالقشطة', hex: '#fff3dc', images: ['qatayef-cream', 'qatayef-cream-2'] }
    ],
    stock: 20, rating: 4.7, reviews: 98, tags: ['featured'],
    desc: 'قطايف محشية مكسرات وزبيب أو قشطة طازة، مقلية ومغموسة في شربات خفيف. ريحة رمضان طول السنة.',
    details: ['حشوة مكسرات أو قشطة', 'مقلية في زيت نضيف', 'شربات على الجنب', 'متاحة طول السنة']
  },
  {
    id: 5, name: 'بسبوسة بالسمن البلدي', cat: 'basbousa', price: 220, oldPrice: null, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'سادة باللوز', hex: '#e9ae55', images: ['basbousa', 'basbousa-2'] }],
    stock: 30, rating: 4.9, reviews: 310, tags: ['featured', 'signature'],
    desc: 'بسبوسة طرية بالسمن البلدي والزبادي، مقطّعة معيّنات وكل قطعة عليها لوزة. البسبوسة اللي بتفكّرك بتاعة تيتا.',
    details: ['سمن بلدي 100%', 'لوز مقشّر', 'شربات بماء الورد', 'تعيش 4 أيام برّه التلاجة']
  },
  {
    id: 6, name: 'بسبوسة بالقشطة', cat: 'basbousa', price: 300, oldPrice: null, unit: 'الكيلو',
    flavor: 'cream', occasion: 'guests', sizes: KILO,
    variants: [{ name: 'قشطة وفستق', hex: '#fff3dc', images: ['basbousa-cream', 'basbousa-cream-2'] }],
    stock: 12, rating: 4.8, reviews: 124, tags: ['new', 'featured'],
    desc: 'طبقتين بسبوسة بينهم قشطة طازة، ومن فوق فستق مجروش. خفيفة ومش مسكّرة زيادة.',
    details: ['طبقة قشطة في النص', 'فستق مجروش', 'تتحفظ في التلاجة', 'تتقدّم باردة']
  },
  {
    id: 7, name: 'بسبوسة نوتيلا', cat: 'basbousa', price: 320, oldPrice: 380, unit: 'الكيلو',
    flavor: 'chocolate', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'نوتيلا وبندق', hex: '#6b3a22', images: ['basbousa-nutella', 'basbousa-nutella-2'] }],
    stock: 8, rating: 4.6, reviews: 61, tags: ['sale'],
    desc: 'بسبوسة كلاسيك عليها خطوط نوتيلا وبندق محمّص. مزيج الشرقي والغربي في قطعة واحدة.',
    details: ['نوتيلا أصلية', 'بندق محمّص', 'شربات خفيف جدًا', 'محبوبة عند الأطفال']
  },
  {
    id: 8, name: 'هريسة باللوز', cat: 'basbousa', price: 240, oldPrice: null, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'لوز', hex: '#d38b42', images: ['harissa', 'harissa-2'] }],
    stock: 18, rating: 4.7, reviews: 87, tags: [],
    desc: 'هريسة إسكندراني محمّرة بالسمن، أتقل شوية من البسبوسة وطعمها أغنى. عليها لوز محمّص.',
    details: ['سمن بلدي', 'جوز هند خفيف', 'لوز محمّص', 'وصفة إسكندراني']
  },
  {
    id: 9, name: 'بقلاوة بالفستق', cat: 'baklava', price: 750, oldPrice: null, unit: 'الكيلو',
    flavor: 'pistachio', occasion: 'gift', sizes: KILO,
    variants: [{ name: 'فستق حلبي', hex: '#8cbf4d', images: ['baklava', 'baklava-2'] }],
    stock: 6, rating: 4.9, reviews: 154, tags: ['signature', 'featured'],
    desc: '40 طبقة رقائق رفيعة بالسمن البلدي ومحشية فستق حلبي، مقرمشة من برّه وطرية من جوّه.',
    details: ['40 طبقة رقائق', 'فستق حلبي فاخر', 'سمن بلدي', 'تعيش أسبوع']
  },
  {
    id: 10, name: 'عش البلبل', cat: 'baklava', price: 820, oldPrice: null, unit: 'الكيلو',
    flavor: 'pistachio', occasion: 'gift', sizes: KILO,
    variants: [{ name: 'فستق حلبي', hex: '#6e9e3a', images: ['nest', 'nest-2'] }],
    stock: 5, rating: 4.9, reviews: 66, tags: ['new', 'signature'],
    desc: 'أعشاش كنافة شعر محمّرة ومليانة فستق حلبي كامل. شكل يفرّح وطعم يبهر.',
    details: ['كنافة شعر', 'فستق حلبي كامل', 'شربات خفيف', 'مناسبة للضيافة']
  },
  {
    id: 11, name: 'جلاش بالمكسرات', cat: 'baklava', price: 460, oldPrice: null, unit: 'الكيلو',
    flavor: 'nuts', occasion: 'guests', sizes: KILO,
    variants: [{ name: 'مكسرات مشكلة', hex: '#e9ae55', images: ['goulash', 'goulash-2'] }],
    stock: 16, rating: 4.7, reviews: 92, tags: ['featured'],
    desc: 'رقائق جلاش مقرمشة محشية عين جمل ولوز وبندق، مقطّعة مربعات سهلة في التقديم.',
    details: ['مكسرات مشكلة', 'رقائق مقرمشة', 'عسل خفيف', 'تعيش أسبوع']
  },
  {
    id: 12, name: 'صينية شرقي مشكّل', cat: 'baklava', price: 640, oldPrice: 720, unit: 'الكيلو',
    flavor: 'nuts', occasion: 'gift', sizes: KILO,
    variants: [{ name: 'تشكيلة شهد', hex: '#f2a93b', images: ['assorted', 'assorted-2'] }],
    stock: 7, rating: 4.8, reviews: 118, tags: ['sale', 'featured'],
    desc: 'تشكيلة من أحلى أصنافنا: بقلاوة، عش بلبل، كحك وبسبوسة في صينية واحدة. الهدية اللي متغلطش.',
    details: ['تشكيلة 5 أصناف', 'صينية تقديم أنيقة', 'كارت إهداء مجاني', 'تعيش 5 أيام']
  },
  {
    id: 13, name: 'كحك بالعجمية', cat: 'kahk', price: 340, oldPrice: null, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'ramadan', sizes: KILO,
    variants: [
      { name: 'بالعجمية', hex: '#f2d29a', images: ['kahk', 'kahk-2'] },
      { name: 'سادة', hex: '#fbf2df', images: ['kahk-2', 'kahk'] }
    ],
    stock: 25, rating: 4.9, reviews: 260, tags: ['featured', 'signature'],
    desc: 'كحك العيد بالسمن البلدي، بيدوب في البُق، محشي عجمية بالعسل ومتغطي سكر بودرة.',
    details: ['سمن بلدي', 'عجمية بالعسل', 'نقش يدوي', 'يعيش أسبوعين']
  },
  {
    id: 14, name: 'معمول بالتمر', cat: 'kahk', price: 380, oldPrice: null, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'ramadan', sizes: KILO,
    variants: [
      { name: 'بالتمر', hex: '#8a5a2e', images: ['maamoul', 'maamoul-2'] },
      { name: 'بالفستق', hex: '#8cbf4d', images: ['maamoul-2', 'maamoul'] }
    ],
    stock: 15, rating: 4.8, reviews: 73, tags: ['new'],
    desc: 'معمول بالسميد والسمن محشي عجوة أو فستق، بنقشة شامي تقليدية وسكر بودرة.',
    details: ['سميد وسمن', 'عجوة أو فستق', 'نقش بالقالب الخشب', 'يعيش أسبوعين']
  },
  {
    id: 15, name: 'غريبة بالسمن', cat: 'kahk', price: 300, oldPrice: null, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'بالفستق', hex: '#fbf2df', images: ['ghorayeba', 'ghorayeba-2'] }],
    stock: 22, rating: 4.8, reviews: 101, tags: [],
    desc: 'غريبة بيضا ناعمة بتدوب أول ما تلمس لسانك، وفي نص كل قطعة حباية فستق.',
    details: ['3 مكونات بس', 'سمن بلدي', 'فستق حلبي', 'مع الشاي بتاعك']
  },
  {
    id: 16, name: 'بسكويت النشادر', cat: 'kahk', price: 190, oldPrice: 230, unit: 'الكيلو',
    flavor: 'ghee', occasion: 'daily', sizes: KILO,
    variants: [{ name: 'فانيليا', hex: '#eabf7a', images: ['biscuits', 'biscuits-2'] }],
    stock: 35, rating: 4.6, reviews: 84, tags: ['sale'],
    desc: 'بسكويت بيتي مقرمش بالفانيليا والسمن، رفيق الشاي بالحليب في الصبح.',
    details: ['فانيليا طبيعي', 'مقرمش وخفيف', 'من غير مواد حافظة', 'يعيش 3 أسابيع']
  },
  {
    id: 17, name: 'تورتة الفراولة', cat: 'cakes', price: 450, oldPrice: null, unit: 'الصغيرة',
    flavor: 'cream', occasion: 'guests', sizes: CAKE,
    variants: [{ name: 'فراولة وكريمة', hex: '#ffc6d4', images: ['cake-strawberry', 'cake-strawberry-2'] }],
    stock: 8, rating: 4.9, reviews: 132, tags: ['featured', 'signature'],
    desc: 'كيكة فانيليا هشة بطبقات كريمة شانتيه وفراولة طازة. اكتب اسم صاحب العيد في الملاحظات.',
    details: ['فراولة طازة', 'كريمة شانتيه', 'كتابة الاسم مجانًا', 'تُطلب قبلها بيوم']
  },
  {
    id: 18, name: 'تورتة الشوكولاتة', cat: 'cakes', price: 520, oldPrice: null, unit: 'الصغيرة',
    flavor: 'chocolate', occasion: 'guests', sizes: CAKE,
    variants: [{ name: 'شوكولاتة وكريز', hex: '#7a432a', images: ['cake-chocolate', 'cake-chocolate-2'] }],
    stock: 6, rating: 4.9, reviews: 118, tags: ['new', 'featured'],
    desc: 'كيكة شوكولاتة رطبة بجاناش بلجيكي غني وكريز وسبرينكلز ملونة.',
    details: ['شوكولاتة بلجيكي', 'جاناش غني', 'كتابة الاسم مجانًا', 'تُطلب قبلها بيوم']
  },
  {
    id: 19, name: 'تشيز كيك التوت', cat: 'cakes', price: 480, oldPrice: null, unit: 'الصغيرة',
    flavor: 'cream', occasion: 'guests', sizes: CAKE,
    variants: [{ name: 'توت مشكل', hex: '#b5274f', images: ['cheesecake', 'cheesecake-2'] }],
    stock: 5, rating: 4.8, reviews: 64, tags: ['new'],
    desc: 'تشيز كيك نيويورك مخبوز على قاعدة بسكويت بالزبدة، ومن فوق صوص توت وتوت طازة.',
    details: ['جبنة كريمي', 'قاعدة بسكويت بالزبدة', 'صوص توت بيتي', 'يتقدّم بارد']
  },
  {
    id: 20, name: 'جاتوه مشكّل', cat: 'cakes', price: 240, oldPrice: null, unit: '6 قطع',
    flavor: 'chocolate', occasion: 'guests', sizes: ['box6', 'box12'],
    variants: [{ name: 'تشكيلة ألوان', hex: '#ffb3c6', images: ['gateau', 'gateau-2'] }],
    stock: 12, rating: 4.7, reviews: 57, tags: ['featured'],
    desc: 'قطع جاتوه صغيرة ملونة: فراولة، شوكولاتة، مانجو وفستق. مثالية لحفلات الأطفال.',
    details: ['6 نكهات', 'قطع على قد اللقمة', 'علبة هدية', 'تتحفظ في التلاجة']
  },
  {
    id: 21, name: 'أم علي بالمكسرات', cat: 'cups', price: 75, oldPrice: null, unit: 'الفخارة',
    flavor: 'nuts', occasion: 'daily', sizes: ['c1', 'c4'],
    variants: [{ name: 'مكسرات وزبيب', hex: '#f2c472', images: ['om-ali', 'om-ali-2'] }],
    stock: 24, rating: 4.9, reviews: 190, tags: ['featured'],
    desc: 'أم علي سخنة في فخارة، رقائق منفوخة باللبن والقشطة والمكسرات وجوز الهند.',
    details: ['تتسخن في الفرن', 'لبن كامل الدسم', 'مكسرات وزبيب', 'فخارة هدية']
  },
  {
    id: 22, name: 'أرز بلبن', cat: 'cups', price: 45, oldPrice: null, unit: 'الكاسة',
    flavor: 'cream', occasion: 'daily', sizes: ['c1', 'c4'],
    variants: [{ name: 'قرفة', hex: '#fffaf0', images: ['rice-pudding', 'rice-pudding-2'] }],
    stock: 40, rating: 4.8, reviews: 230, tags: ['featured'],
    desc: 'أرز بلبن كريمي متسوّي على نار هادية، ومن فوق قرفة وزبيب. بارد ومنعش.',
    details: ['لبن كامل الدسم', 'قرفة وزبيب', 'سكر معتدل', 'يتقدّم بارد']
  },
  {
    id: 23, name: 'مهلبية بالفستق', cat: 'cups', price: 50, oldPrice: null, unit: 'الكاسة',
    flavor: 'pistachio', occasion: 'daily', sizes: ['c1', 'c4'],
    variants: [{ name: 'فستق وماء ورد', hex: '#ffb3c6', images: ['mahalabia', 'mahalabia-2'] }],
    stock: 30, rating: 4.8, reviews: 112, tags: ['new'],
    desc: 'مهلبية ناعمة بماء الورد، عليها فستق مجروش وورد مجفف. خفيفة بعد الأكل.',
    details: ['ماء ورد طبيعي', 'فستق مجروش', 'ورد مجفف', 'تتقدّم باردة']
  },
  {
    id: 24, name: 'زلابية بالعسل', cat: 'cups', price: 70, oldPrice: 85, unit: 'العلبة',
    flavor: 'nuts', occasion: 'daily', sizes: ['sm', 'lg'],
    variants: [{ name: 'عسل وسكر بودرة', hex: '#ffb72e', images: ['zalabya', 'zalabya-2'] }],
    stock: 28, rating: 4.7, reviews: 95, tags: ['sale'],
    desc: 'لقيمات مقرمشة من برّه وهشة من جوّه، متغرّقة عسل وسكر بودرة. تتاكل سخنة.',
    details: ['تتعمل وقت الطلب', 'عسل نحل طبيعي', 'سكر بودرة', 'العلبة الكبيرة 40 قطعة']
  }
];

/* سعر وحدة الصنف حسب الوزن/الحجم المختار */
function sizePrice(p, size) {
  const f = (SIZE_OPTIONS[size] || { factor: 1 }).factor;
  return Math.round(p.price * f / 5) * 5;
}
const sizeLabel = s => (SIZE_OPTIONS[s] || { label: s }).label;
const defaultSize = p => (p.sizes.includes('h') ? 'h' : p.sizes[0]);

/* آراء العملاء (تُوزّع على الأصناف) */
const SEED_REVIEWS = [
  { name: 'منة الله ع.', city: 'القاهرة', rating: 5, text: 'الكنافة وصلت سخنة ومقرمشة، والقشطة طعمها طازة جدًا. أكيد هطلب تاني.' },
  { name: 'أحمد م.', city: 'الإسكندرية', rating: 5, text: 'البسبوسة طرية والسمن ريحته حلوة، والسكر مظبوط مش زيادة.' },
  { name: 'نورهان ك.', city: 'الجيزة', rating: 4, text: 'جميلة جدًا، الدليفري اتأخر ربع ساعة بس خدمة العملاء كانوا محترمين.' },
  { name: 'محمود ح.', city: 'المنصورة', rating: 5, text: 'تاني مرة أطلب الكحك من شهد، بيدوب في البُق فعلًا.' },
  { name: 'هبة س.', city: 'طنطا', rating: 5, text: 'طلبت صينية مشكّل لعزومة وكل الناس سألوني جايباها منين.' },
  { name: 'كريم ف.', city: 'أسيوط', rating: 4, text: 'التغليف ممتاز والحلويات وصلت سليمة رغم المسافة.' }
];

const TESTIMONIALS = [
  { name: 'ملك الشريف', role: 'عميلة من 2023', text: 'أول مرة ألاقي بسبوسة طعمها زي بتاعة تيتا بالظبط. السمن البلدي فارق جدًا.', product: 'بسبوسة بالسمن البلدي' },
  { name: 'يوسف عادل', role: 'عريس 2026', text: 'طلبنا صواني المشكّل لكتب الكتاب، الشكل كان يفتح النفس والطعم أحلى. شكرًا يا شهد.', product: 'صينية شرقي مشكّل' },
  { name: 'د. رحاب منصور', role: 'أم لثلاثة', text: 'الولاد بقوا مستنيين يوم الجمعة عشان الكنافة النوتيلا. خفيفة ومش مسكّرة زيادة.', product: 'كنافة نوتيلا' },
  { name: 'فرح النجار', role: 'منظمة حفلات', text: 'التورت دايمًا في المعاد والكتابة عليها نضيفة. الجاتوه المشكّل نجم أي حفلة أطفال.', product: 'جاتوه مشكّل' }
];

/* مناطق التوصيل */
const SHIPPING_ZONES = {
  metro: { label: 'القاهرة الكبرى', fee: 40, days: '1' },
  delta: { label: 'الدلتا والإسكندرية والقناة', fee: 60, days: '1–2' },
  upper: { label: 'الصعيد', fee: 80, days: '2–3' },
  remote: { label: 'المحافظات الحدودية', fee: 110, days: '3–5' }
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
const FREE_SHIPPING_MIN = 1000;
const PRICE_MAX = 1500;

/* أكواد الخصم التجريبية */
const COUPONS = {
  SHAHD10: { type: 'percent', value: 10, min: 0, label: 'خصم 10% على طلبك' },
  WELCOME15: { type: 'percent', value: 15, min: 500, label: 'خصم 15% للطلبات فوق 500 ج.م' },
  SWEET100: { type: 'fixed', value: 100, min: 1200, label: 'خصم 100 ج.م للطلبات فوق 1,200 ج.م' }
};

const ORDER_STEPS = [
  { key: 'placed', label: 'تم استلام الطلب', note: 'وصلنا طلبك وجارٍ مراجعته' },
  { key: 'prep', label: 'في المطبخ', note: 'بنحضّر طلبك طازة ونغلّفه بعناية' },
  { key: 'shipped', label: 'جاهز للتوصيل', note: 'الطلب اتسلّم للمندوب' },
  { key: 'out', label: 'في الطريق', note: 'المندوب في طريقه ليك' },
  { key: 'delivered', label: 'تم التسليم', note: 'بالهنا والشفا!' }
];

const STORE_INFO = {
  whatsapp: '201000000000',
  phone: '+20 100 000 0000',
  email: 'hello@shahd.sweets',
  instagram: '@shahd.sweets',
  address: 'مصر الجديدة، القاهرة'
};
