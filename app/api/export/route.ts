import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"

// 定义数据类型
interface SceneData {
  shot_number?: string | null
  shot_type?: string | null
  duration_seconds?: number | string | null
  frame?: string | null
  content?: string | null
  notes?: string | null
  image_url?: string | null
}

interface ProjectData {
  title: string
}

export async function POST(request: NextRequest) {
  try {
    const { project, scenes }: { project: ProjectData; scenes: SceneData[] } = await request.json()

    if (!project || !scenes || scenes.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const workbook = new ExcelJS.Workbook()
    
    // 创建工作表
    const worksheet = workbook.addWorksheet("Storyboard", {
      properties: { tabColor: { argb: "FF0070C0" } },
      pageSetup: { 
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1, 
        fitToHeight: 0 
      },
    })

    // 定义列宽
    worksheet.columns = [
      { key: "index", width: 6 },
      { key: "image", width: 40 },
      { key: "info", width: 15 },
      { key: "desc", width: 35 },
      { key: "audio", width: 30 },
    ]

    // 样式定义
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FF999999" } },
      left: { style: "thin", color: { argb: "FF999999" } },
      bottom: { style: "thin", color: { argb: "FF999999" } },
      right: { style: "thin", color: { argb: "FF999999" } },
    }

    const baseFont = { name: "Microsoft YaHei", size: 10, color: { argb: "FF333333" } }
    const centerAlign: Partial<ExcelJS.Alignment> = { vertical: "middle", horizontal: "center", wrapText: true }
    const leftAlign: Partial<ExcelJS.Alignment> = { vertical: "middle", horizontal: "left", wrapText: true }

    // 添加大标题
    const titleRow = worksheet.addRow([project.title.toUpperCase()])
    titleRow.height = 45
    worksheet.mergeCells("A1:E1")
    titleRow.getCell(1).style = {
      font: { name: "Microsoft YaHei", size: 18, bold: true, color: { argb: "FF000000" } },
      alignment: centerAlign,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } }
    }

    // 添加表头
    const headerRow = worksheet.addRow(["No.", "画面预览", "镜头参数", "画面描述 (Action)", "台词/备注 (Dialogue/Notes)"])
    headerRow.height = 30
    headerRow.eachCell((cell) => {
      cell.style = {
        font: { name: "Microsoft YaHei", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        alignment: centerAlign,
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } },
        border: borderStyle
      }
    })

    // 循环处理场景数据
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      
      const infoText = [
        scene.shot_number ? `镜头号: ${scene.shot_number}` : null,
        scene.shot_type ? `景别: ${scene.shot_type}` : null,
        scene.duration_seconds ? `时长: ${scene.duration_seconds}s` : null
      ].filter(Boolean).join("\n\n")

      const row = worksheet.addRow([
        i + 1,
        "",
        infoText,
        scene.frame || "",
        [scene.content ? `[台词]: ${scene.content}` : null, scene.notes ? `[备注]: ${scene.notes}` : null].filter(Boolean).join("\n\n")
      ])

      row.height = 135

      row.getCell(1).style = { font: { ...baseFont, bold: true }, alignment: centerAlign, border: borderStyle }
      row.getCell(2).style = { border: borderStyle }
      row.getCell(3).style = { font: { ...baseFont, size: 9, color: { argb: "FF666666" } }, alignment: centerAlign, border: borderStyle }
      row.getCell(4).style = { font: baseFont, alignment: { ...leftAlign, indent: 1 }, border: borderStyle }
      row.getCell(5).style = { font: baseFont, alignment: { ...leftAlign, indent: 1 }, border: borderStyle }

      // 处理图片 - 在服务端下载
      if (scene.image_url) {
        try {
          const response = await fetch(scene.image_url)
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(new Uint8Array(arrayBuffer))

            let ext: "png" | "jpeg" | "gif" = "png"
            if (scene.image_url.match(/\.(jpg|jpeg)$/i)) ext = "jpeg"
            
            const imageId = workbook.addImage({
              buffer: buffer as any,
              extension: ext,
            })

            worksheet.addImage(imageId, {
              tl: { col: 1.05, row: row.number - 1 + 0.05 } as any, 
              br: { col: 1.95, row: row.number - 0.05 } as any,
              editAs: "oneCell"
            })
          }
        } catch (err) {
          console.error(`Error fetching image for scene ${i}:`, err)
          row.getCell(2).value = "[图片加载失败]"
          row.getCell(2).alignment = centerAlign
        }
      } else {
        row.getCell(2).value = "NO IMAGE"
        row.getCell(2).font = { color: { argb: "FFCCCCCC" }, italic: true }
        row.getCell(2).alignment = centerAlign
      }
    }

    // 页脚
    const footerRow = worksheet.addRow([`Generated by Nexis AI Storyboard - ${new Date().toLocaleDateString()}`])
    worksheet.mergeCells(`A${footerRow.number}:E${footerRow.number}`)
    footerRow.getCell(1).style = {
        alignment: { horizontal: "right" },
        font: { size: 8, color: { argb: "FFAAAAAA" }, italic: true }
    }

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer()
    
    // 生成文件名
    const filename = `${project.title.replace(/\s+/g, "_")}_Storyboard.xlsx`
    
    // 直接返回文件流，不需要 Base64 转换
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })

  } catch (error) {
    console.error("Export failed:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
