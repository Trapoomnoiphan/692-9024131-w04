import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import type {
  ApiResponse,
  CreateProductBody,
  Product,
} from "@/types/products";

type ProductRow = Product & RowDataPacket;

// 1. GET /api/products : ดึงข้อมูลทั้งหมด
export async function GET(): Promise<NextResponse<Product[] | ApiResponse>> {
  try {
    const products = await query<ProductRow[]>({
      query: "SELECT * FROM products",
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Database error: ${String(error)}`, status: 500 },
      { status: 500 }
    );
  }
}

// 3. POST /api/products : เพิ่มข้อมูลใหม่
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse>> {
  try {
    const { product_name, category, price, stock }: CreateProductBody =
      await request.json();

    if (!product_name || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { message: "กรุณาระบุข้อมูลให้ครบทุกฟิลด์", status: 400 },
        { status: 400 }
      );
    }

    const result = await query<ResultSetHeader>({
      query:
        "INSERT INTO products (product_name, category, price, stock) VALUES (?, ?, ?, ?)",
      values: [product_name, category, price, stock],
    });

    const success = result.affectedRows > 0;
    return NextResponse.json(
      {
        message: success ? "success" : "error",
        status: success ? 201 : 400,
        product: {
          id: result.insertId,
          product_name,
          category,
          price,
          stock,
        },
      },
      { status: success ? 201 : 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Database error: ${String(error)}`, status: 500 },
      { status: 500 }
    );
  }
}