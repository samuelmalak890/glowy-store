import { Category } from "@prisma/client";
import { saveCategory } from "@/app/actions/storefront";

export function CategoryForm({ category }: { category?: Category }) { return <form action={saveCategory} className="form" dir="rtl">
  {category && <input type="hidden" name="id" value={category.id}/>}<div className="two"><label>اسم القسم بالعربي<input name="nameAr" required defaultValue={category?.nameAr}/></label><label>الاسم بالإنجليزية<input name="nameEn" required defaultValue={category?.nameEn}/></label></div>
  <div className="two"><label>الرابط المختصر (إنجليزي)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="skincare" defaultValue={category?.slug}/><small>حروف إنجليزية صغيرة وشرطة فقط.</small></label><label>ترتيب الظهور<input name="position" type="number" min="0" defaultValue={category?.position ?? 0}/></label></div>
  <label>رابط صورة القسم<input name="imageUrl" type="url" placeholder="https://..." defaultValue={category?.imageUrl ?? ""}/><small>اختياري. ستظهر الصورة بشكل دائري في الصفحة الرئيسية.</small></label>
  <label className="check-line"><input name="isVisible" type="checkbox" defaultChecked={category?.isVisible ?? true}/> إظهار هذا القسم للزوار</label>
  <button className="button">حفظ القسم</button>
</form>; }
