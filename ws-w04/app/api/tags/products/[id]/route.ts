import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import type {
  ApiResponse,
  Product,
  UpdateProductBody,
} from "@/types/products";

type ProductRow = Product & RowDataPacket;

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 2. GET /api/products/[id] : ดึงข้อมูลเฉพาะเรคอร์ดที่ระบุ id
export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<Product | ApiResponse>> {
  try {
    const { id } = await params;
    const products = await query<ProductRow[]>({
      query: "SELECT * FROM products WHERE id = ?",
      values: [id],
    });

    if (products.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลสินค้าที่ระบุ", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(products[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Database error: ${String(error)}`, status: 500 },
      { status: 500 }
    );
  }
}

// 4. PUT /api/products/[id] : แก้ไขข้อมูลตาม id
export async function PUT(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    const { product_name, category, price, stock }: UpdateProductBody =
      await request.json();

    const result = await query<ResultSetHeader>({
      query:
        "UPDATE products SET product_name = ?, category = ?, price = ?, stock = ? WHERE id = ?",
      values: [product_name, category, price, stock, id],
    });

    const success = result.affectedRows > 0;
    return NextResponse.json(
      {
        message: success ? "success" : "ไม่พบข้อมูลสำหรับแก้ไข",
        status: success ? 200 : 404,
        product: success
          ? { id: Number(id), product_name, category, price, stock }
          : undefined,
      },
      { status: success ? 200 : 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Database error: ${String(error)}`, status: 500 },
      { status: 500 }
    );
  }
}

// 5. DELETE /api/products/[id] : ลบข้อมูลตาม id
export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;

    const result = await query<ResultSetHeader>({
      query: "DELETE FROM products WHERE id = ?",
      values: [id],
    });

    const success = result.affectedRows > 0;
    return NextResponse.json(
      {
        message: success ? "success" : "ไม่พบข้อมูลสำหรับลบ",
        status: success ? 200 : 404,
        product: success ? { id: Number(id) } : undefined,
      },
      { status: success ? 200 : 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Database error: ${String(error)}`, status: 500 },
      { status: 500 }
    );
  }
}