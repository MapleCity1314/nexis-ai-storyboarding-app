"use server"

import ExcelJS from "exceljs"

// 定义数据类型 (根据你的实际 Prisma/Type 定义调整)
interface SceneData {
  shot_number?: string | null
  shot_type?: string | null
  duration_seconds?: number | string | null
  frame?: string | null // 画面描述
  content?: string | null // 旁白/台词
  notes?: string | null
  image_url?: string | null
}

interface ProjectData {
  title: string
}

export async function generateStoryboardExcel(project: ProjectData, scenes: SceneData[]) {
  try {
    const workbook = new ExcelJS.Workbook()
    
    // 创建工作表
    const worksheet = workbook.addWorksheet("Storyboard", {
      properties: { tabColor: { argb: "FF0070C0" } }, // 标签颜色
      pageSetup: { 
        paperSize: 9, // A4
        orientation: "landscape", // 横向
        fitToPage: true, // 适应页面
        fitToWidth: 1, 
        fitToHeight: 0 
      },
    })

    // --- 1. 定义列宽 (优化比例) ---
    worksheet.columns = [
      { key: "index", width: 6 },     // A: 序号
      { key: "image", width: 40 },    // B: 画面 (预留大空间)
      { key: "info", width: 15 },     // C: 镜头信息 (编号/景别/时长)
      { key: "desc", width: 35 },     // D: 画面内容/描述
      { key: "audio", width: 30 },    // E: 台词/备注
    ]

    // --- 2. 样式定义 ---
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FF999999" } },
      left: { style: "thin", color: { argb: "FF999999" } },
      bottom: { style: "thin", color: { argb: "FF999999" } },
      right: { style: "thin", color: { argb: "FF999999" } },
    }

    const baseFont = { name: "Microsoft YaHei", size: 10, color: { argb: "FF333333" } }
    const centerAlign: Partial<ExcelJS.Alignment> = { vertical: "middle", horizontal: "center", wrapText: true }
    const leftAlign: Partial<ExcelJS.Alignment> = { vertical: "middle", horizontal: "left", wrapText: true }

    // --- 3. 添加大标题 ---
    const titleRow = worksheet.addRow([project.title.toUpperCase()])
    titleRow.height = 45
    worksheet.mergeCells("A1:E1")
    titleRow.getCell(1).style = {
      font: { name: "Microsoft YaHei", size: 18, bold: true, color: { argb: "FF000000" } },
      alignment: centerAlign,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } }
    }

    // --- 4. 添加表头 ---
    const headerRow = worksheet.addRow(["No.", "画面预览", "镜头参数", "画面描述 (Action)", "台词/备注 (Dialogue/Notes)"])
    headerRow.height = 30
    headerRow.eachCell((cell) => {
      cell.style = {
        font: { name: "Microsoft YaHei", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        alignment: centerAlign,
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } }, // 深蓝色专业感
        border: borderStyle
      }
    })

    // --- 5. 循环处理场景数据 ---
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      
      // 组合镜头参数文本，使其在Excel中显得整洁
      const infoText = [
        scene.shot_number ? `镜头号: ${scene.shot_number}` : null,
        scene.shot_type ? `景别: ${scene.shot_type}` : null,
        scene.duration_seconds ? `时长: ${scene.duration_seconds}s` : null
      ].filter(Boolean).join("\n\n")

      const row = worksheet.addRow([
        i + 1,        // 序号
        "",           // 图片占位
        infoText,     // 镜头参数
        scene.frame || "", // 画面描述
        [scene.content ? `[台词]: ${scene.content}` : null, scene.notes ? `[备注]: ${scene.notes}` : null].filter(Boolean).join("\n\n") // 备注
      ])

      // 设定行高，保证图片能放得下且好看
      row.height = 135 

      // 应用单元格样式
      row.getCell(1).style = { font: { ...baseFont, bold: true }, alignment: centerAlign, border: borderStyle } // 序号
      row.getCell(2).style = { border: borderStyle } // 图片格
      row.getCell(3).style = { font: { ...baseFont, size: 9, color: { argb: "FF666666" } }, alignment: centerAlign, border: borderStyle } // 参数
      row.getCell(4).style = { font: baseFont, alignment: { ...leftAlign, indent: 1 }, border: borderStyle } // 描述
      row.getCell(5).style = { font: baseFont, alignment: { ...leftAlign, indent: 1 }, border: borderStyle } // 备注

      // --- 处理图片 (核心逻辑) ---
      if (scene.image_url) {
        try {
          // 服务端 Fetch 图片，解决 CORS 问题
          const response = await fetch(scene.image_url)
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(new Uint8Array(arrayBuffer))

            // 简单判断扩展名
            let ext: "png" | "jpeg" | "gif" = "png"
            if (scene.image_url.match(/\.(jpg|jpeg)$/i)) ext = "jpeg"
            
            const imageId = workbook.addImage({
              buffer: buffer as any,
              extension: ext,
            })

            // 计算图片位置，留出一点内边距 (Padding)
            // tl: Top Left, br: Bottom Right
            // col: 1 代表第2列(B列)
            worksheet.addImage(imageId, {
              tl: { col: 1.05, row: row.number - 1 + 0.05 } as any, 
              br: { col: 1.95, row: row.number - 0.05 } as any,
              editAs: "oneCell" // 让图片随单元格移动但不随大小剧烈变形
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

    // --- 6. 页脚 ---
    const footerRow = worksheet.addRow([`Generated by AI Storyboard - ${new Date().toLocaleDateString()}`])
    worksheet.mergeCells(`A${footerRow.number}:E${footerRow.number}`)
    footerRow.getCell(1).style = {
        alignment: { horizontal: "right" },
        font: { size: 8, color: { argb: "FFAAAAAA" }, italic: true }
    }

    // --- 7. 导出二进制 ---
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Server Action 不能直接传回 Buffer 对象给 Client (序列化限制)
    // 我们将其转为 Base64 字符串返回
    return {
      success: true,
      data: Buffer.from(buffer).toString("base64"),
      filename: `${project.title.replace(/\s+/g, "_")}_Storyboard.xlsx`
    }

  } catch (error) {
    console.error("Storyboard generation failed:", error)
    return { success: false, error: "Failed to generate storyboard" }
  }
}