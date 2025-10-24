# 🎯 نظام ترتيب المنتجات - السحب والإفلات (Drag & Drop)

## 📝 ملخص التحديث

تم تحديث نظام ترتيب المنتجات ليدعم **السحب والإفلات (Drag & Drop)** بدلاً من التحريك خطوة واحدة (up/down).

### ✨ المميزات الجديدة
- ✅ دعم السحب والإفلات - حرك المنتج لأي موضع مباشرة
- ✅ إعادة ترتيب تلقائية لجميع المنتجات
- ✅ متوافق مع النظام القديم (up/down) - backward compatible
- ✅ يعمل مع ReorderableListView في Flutter

---

## 🔄 المقارنة بين النظامين

### النظام القديم ❌ (Up/Down)
```json
PUT /api/products/:id/reorder
{
  "direction": "up"  // أو "down"
}
```
**المشكلة:** يحرك المنتج خطوة واحدة فقط - غير مناسب للسحب والإفلات

### النظام الجديد ✅ (Drag & Drop)
```json
PUT /api/products/:id/reorder
{
  "newPosition": 3
}
```
**الميزة:** يحرك المنتج مباشرة للموضع المطلوب - مثالي للسحب والإفلات

---

## 🚀 استخدام API - Drag & Drop

### Endpoint
```
PUT /api/products/:id/reorder
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "newPosition": 2
}
```
أو
```json
{
  "newOrderBy": 2
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "id": 5,
    "old_position": 7,
    "new_position": 2
  },
  "message": "Product reordered successfully",
  "timestamp": "2024-10-24T08:00:00.000Z"
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "newPosition/newOrderBy must be a non-negative number",
  "timestamp": "2024-10-24T08:00:00.000Z"
}
```

---

## 💡 أمثلة الاستخدام

### مثال 1: نقل منتج من الموضع 5 إلى الموضع 0 (الأول)
```bash
curl -X PUT http://localhost:3000/api/products/123/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPosition": 0
  }'
```

**النتيجة:**
- المنتج 123 ينتقل للموضع 0 (الأول في القائمة)
- جميع المنتجات الأخرى يتم إعادة ترقيمها تلقائياً

### مثال 2: نقل منتج للموضع الأخير
```bash
curl -X PUT http://localhost:3000/api/products/456/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPosition": 99
  }'
```

**ملاحظة:** إذا كان الموضع أكبر من عدد المنتجات، سينتقل للنهاية تلقائياً.

### مثال 3: استخدام النظام القديم (Up/Down) - لا يزال يعمل
```bash
curl -X PUT http://localhost:3000/api/products/789/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "up"
  }'
```

---

## 📱 التطبيق في Flutter

### الطريقة المثالية: ReorderableListView

```dart
import 'package:flutter/material.dart';

class ProductsScreen extends StatefulWidget {
  @override
  _ProductsScreenState createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List<Product> products = [];
  
  @override
  void initState() {
    super.initState();
    loadProducts();
  }
  
  Future<void> loadProducts() async {
    // جلب المنتجات من API
    final response = await api.get('/products');
    setState(() {
      products = response.data['products']
          .map<Product>((json) => Product.fromJson(json))
          .toList();
    });
  }
  
  Future<void> reorderProduct(int oldIndex, int newIndex) async {
    // تعديل newIndex إذا كان أكبر من oldIndex
    if (newIndex > oldIndex) {
      newIndex -= 1;
    }
    
    // الحصول على المنتج المراد نقله
    final product = products[oldIndex];
    
    // تحديث محلياً للـ UI السريع
    setState(() {
      products.removeAt(oldIndex);
      products.insert(newIndex, product);
    });
    
    try {
      // إرسال للـ API
      await api.put(
        '/products/${product.id}/reorder',
        data: {
          'newPosition': newIndex,
        },
      );
      
      // عرض رسالة نجاح (اختياري)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم تحديث الترتيب')),
      );
    } catch (e) {
      // في حالة الفشل، إرجاع الترتيب القديم
      setState(() {
        products.removeAt(newIndex);
        products.insert(oldIndex, product);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل تحديث الترتيب')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('المنتجات')),
      body: ReorderableListView.builder(
        itemCount: products.length,
        onReorder: reorderProduct,
        itemBuilder: (context, index) {
          final product = products[index];
          return ListTile(
            key: ValueKey(product.id),
            leading: Icon(Icons.drag_handle),
            title: Text(product.name),
            subtitle: Text('السعر: ${product.price} جنيه'),
            trailing: Text('الكمية: ${product.count}'),
          );
        },
      ),
    );
  }
}
```

### الكود المبسط (بدون Error Handling)
```dart
Future<void> reorderProduct(int oldIndex, int newIndex) async {
  if (newIndex > oldIndex) newIndex -= 1;
  
  final product = products[oldIndex];
  
  setState(() {
    products.removeAt(oldIndex);
    products.insert(newIndex, product);
  });
  
  await api.put('/products/${product.id}/reorder', data: {
    'newPosition': newIndex,
  });
}
```

---

## 🔧 كيف يعمل النظام

### خطوات الترتيب:
1. **تحديد المنتج المراد نقله** (من `product_id` في URL)
2. **إزالة المنتج من قائمة المنتجات الحالية**
3. **إدراج المنتج في الموضع الجديد** (`newPosition`)
4. **إعادة ترقيم جميع المنتجات** (من 0 إلى n-1)
5. **حفظ التحديثات في Database**
6. **إرسال Socket event** لتحديث باقي الأجهزة

### مثال توضيحي:

**الترتيب القديم:**
```
0: Product A (id: 1)
1: Product B (id: 2)
2: Product C (id: 3)
3: Product D (id: 4)  ← نريد نقله
4: Product E (id: 5)
```

**بعد نقل Product D للموضع 1:**
```
0: Product A (id: 1)
1: Product D (id: 4)  ← المنتج المنقول
2: Product B (id: 2)
3: Product C (id: 3)
4: Product E (id: 5)
```

**API Call:**
```json
PUT /api/products/4/reorder
{
  "newPosition": 1
}
```

---

## ⚠️ ملاحظات مهمة

### 1. المواضع تبدأ من 0
```
Position 0 = الأول
Position 1 = الثاني
Position n-1 = الأخير
```

### 2. ReorderableListView في Flutter
عند استخدام `ReorderableListView`، إذا كان `newIndex > oldIndex`، اطرح 1:
```dart
if (newIndex > oldIndex) {
  newIndex -= 1;
}
```
**السبب:** Flutter يحسب الموضع الجديد بعد إزالة العنصر من القائمة.

### 3. Transaction Safety
جميع العمليات تتم داخل **Transaction** - إذا فشلت أي خطوة، يتم إرجاع كل شيء.

### 4. Socket.io Events
سيتم إرسال event عند تحديث الترتيب:
```javascript
socket.on('product:updated', (data) => {
  if (data.reorderType === 'drag-drop') {
    // تحديث القائمة
    console.log(`Product ${data.product.id} moved to position ${data.changes.order_by.new}`);
  }
});
```

---

## 🧪 الاختبار

### Test Case 1: نقل للأمام
```bash
# المنتجات: [A(0), B(1), C(2), D(3), E(4)]
# نقل D من موضع 3 إلى موضع 1

curl -X PUT http://localhost:3000/api/products/4/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPosition": 1}'

# النتيجة المتوقعة: [A(0), D(1), B(2), C(3), E(4)]
```

### Test Case 2: نقل للخلف
```bash
# المنتجات: [A(0), B(1), C(2), D(3), E(4)]
# نقل B من موضع 1 إلى موضع 3

curl -X PUT http://localhost:3000/api/products/2/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPosition": 3}'

# النتيجة المتوقعة: [A(0), C(1), D(2), B(3), E(4)]
```

### Test Case 3: نقل للبداية
```bash
# نقل أي منتج للموضع 0 (الأول)

curl -X PUT http://localhost:3000/api/products/5/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPosition": 0}'
```

### Test Case 4: النظام القديم (Up/Down)
```bash
# لا يزال يعمل - backward compatible

curl -X PUT http://localhost:3000/api/products/3/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'
```

---

## 🎨 مثال UI كامل في Flutter

```dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

class DraggableProductsList extends StatefulWidget {
  @override
  _DraggableProductsListState createState() => _DraggableProductsListState();
}

class _DraggableProductsListState extends State<DraggableProductsList> {
  final Dio dio = Dio();
  List<Product> products = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    fetchProducts();
  }
  
  Future<void> fetchProducts() async {
    try {
      final response = await dio.get(
        'https://your-api.com/api/products',
        options: Options(
          headers: {'Authorization': 'Bearer YOUR_TOKEN'},
        ),
      );
      
      setState(() {
        products = (response.data['data']['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching products: $e');
      setState(() => isLoading = false);
    }
  }
  
  Future<void> onReorder(int oldIndex, int newIndex) async {
    // تعديل newIndex حسب قواعد Flutter
    if (newIndex > oldIndex) {
      newIndex -= 1;
    }
    
    // الحصول على المنتج
    final product = products[oldIndex];
    
    // تحديث UI فوراً (Optimistic Update)
    setState(() {
      products.removeAt(oldIndex);
      products.insert(newIndex, product);
    });
    
    // إرسال للـ Backend
    try {
      await dio.put(
        'https://your-api.com/api/products/${product.id}/reorder',
        data: {'newPosition': newIndex},
        options: Options(
          headers: {'Authorization': 'Bearer YOUR_TOKEN'},
        ),
      );
    } catch (e) {
      // إذا فشل، أرجع الترتيب القديم
      print('Error reordering: $e');
      setState(() {
        products.removeAt(newIndex);
        products.insert(oldIndex, product);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('فشل تحديث الترتيب'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    return ReorderableListView.builder(
      padding: EdgeInsets.all(8),
      itemCount: products.length,
      onReorder: onReorder,
      itemBuilder: (context, index) {
        final product = products[index];
        return Card(
          key: ValueKey(product.id),
          margin: EdgeInsets.symmetric(vertical: 4),
          child: ListTile(
            leading: Icon(Icons.drag_handle, color: Colors.grey),
            title: Text(product.name),
            subtitle: Text('الكود: ${product.code}'),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('${product.price} جنيه'),
                Text('الكمية: ${product.count}', 
                     style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        );
      },
    );
  }
}

// Product Model
class Product {
  final int id;
  final String code;
  final String name;
  final double price;
  final int count;
  final int orderBy;
  
  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.price,
    required this.count,
    required this.orderBy,
  });
  
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      price: double.parse(json['price']?.toString() ?? '0'),
      count: json['count'] ?? 0,
      orderBy: json['order_by'] ?? 0,
    );
  }
}
```

---

## 📊 الفرق في الأداء

| الميزة | Up/Down | Drag & Drop |
|--------|---------|-------------|
| عدد الـ API Calls لنقل 5 مواضع | 5 | 1 ✅ |
| سرعة التحديث | بطيء | سريع ✅ |
| تجربة المستخدم | سيئة | ممتازة ✅ |
| تعقيد الكود | عالي | بسيط ✅ |

---

## ✅ Checklist للـ Frontend Developer

- [ ] تحديث Product Model لاستخدام `order_by`
- [ ] استبدال الأزرار (Up/Down) بـ `ReorderableListView`
- [ ] تنفيذ `onReorder` callback
- [ ] إضافة Optimistic Update للـ UI
- [ ] إضافة Error Handling
- [ ] اختبار السحب والإفلات في أماكن مختلفة
- [ ] إضافة Loading indicator (اختياري)

---

## 🆘 استكشاف الأخطاء

### المشكلة: الترتيب لا يتحدث في Flutter
**الحل:**
```dart
// تأكد من إضافة key فريد لكل item
ListTile(
  key: ValueKey(product.id),  // ✅ مهم جداً
  ...
)
```

### المشكلة: الموضع الجديد خاطئ
**الحل:**
```dart
// تذكر طرح 1 إذا كان newIndex > oldIndex
if (newIndex > oldIndex) {
  newIndex -= 1;
}
```

### المشكلة: API يرجع خطأ
**التحقق:**
1. هل الـ Token صحيح؟
2. هل المستخدم لديه صلاحية `admin`؟
3. هل الـ `newPosition` رقم موجب؟

---

**تم التحديث:** 24 أكتوبر 2024  
**الإصدار:** 2.0.0  
**التوافق:** يدعم النظام القديم (Up/Down) والجديد (Drag & Drop)
