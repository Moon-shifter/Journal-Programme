package com.journalsystem.springprogram.util;

import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.pojo.TeacherInfo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Excel工具类
 * 提供Excel文件生成功能，用于打印催还单等
 */
public class ExcelUtil {
    private ExcelUtil() {
        // 私有构造方法，防止实例化
    }

    // 日期格式化
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 导出逾期催还单Excel
     * @param overdueBorrows 逾期借阅信息列表
     * @return Excel文件字节数组
     */
    public static byte[] exportOverdueNotice(List<BorrowInfo> overdueBorrows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // 创建工作表
            Sheet sheet = workbook.createSheet("逾期催还单");

            // 设置列宽
            sheet.setColumnWidth(0, 20 * 256); // 教师姓名
            sheet.setColumnWidth(1, 20 * 256); // 部门
            sheet.setColumnWidth(2, 30 * 256); // 期刊名称
            sheet.setColumnWidth(3, 15 * 256); // ISSN
            sheet.setColumnWidth(4, 15 * 256); // 借阅日期
            sheet.setColumnWidth(5, 15 * 256); // 应还日期
            sheet.setColumnWidth(6, 15 * 256); // 逾期天数
            sheet.setColumnWidth(7, 20 * 256); // 状态

            // 创建标题行样式
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            titleStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 创建表头行样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // 创建数据行样式
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.CENTER);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // 创建标题行
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(40);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("学院期刊借阅逾期催还单");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 7));

            // 创建表头行
            Row headerRow = sheet.createRow(1);
            headerRow.setHeightInPoints(30);
            String[] headers = {"教师姓名", "所在部门", "期刊名称", "ISSN", "借阅日期", "应还日期", "逾期天数", "状态"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 填充数据
            int rowNum = 2;
            for (BorrowInfo borrow : overdueBorrows) {
                TeacherInfo teacher = borrow.getBorrower();
                JournalInfo journal = borrow.getJournal();
                LocalDate borrowDate = borrow.getStartDate();
                LocalDate dueDate = borrow.getEndDate();
                LocalDate returnDate = borrow.getReturnDate();
                long overdueDays = DateUtil.calculateOverdueDays(dueDate, returnDate);

                Row row = sheet.createRow(rowNum++);
                row.setHeightInPoints(25);

                // 教师姓名
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(teacher.getName());
                cell0.setCellStyle(dataStyle);

                // 部门
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(teacher.getDepartment());
                cell1.setCellStyle(dataStyle);

                // 期刊名称
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(journal.getName());
                cell2.setCellStyle(dataStyle);

                // ISSN
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(journal.getIssn());
                cell3.setCellStyle(dataStyle);

                // 借阅日期
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(borrowDate.format(DATE_FORMATTER));
                cell4.setCellStyle(dataStyle);

                // 应还日期
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(dueDate.format(DATE_FORMATTER));
                cell5.setCellStyle(dataStyle);

                // 逾期天数
                Cell cell6 = row.createCell(6);
                cell6.setCellValue(overdueDays);
                cell6.setCellStyle(dataStyle);

                // 状态
                Cell cell7 = row.createCell(7);
                cell7.setCellValue("逾期");
                cell7.setCellStyle(dataStyle);
            }

            // 写入输出流
            workbook.write(outputStream);
            outputStream.flush();
            return outputStream.toByteArray();
        }
    }

    /**
     * 导出借阅信息Excel
     * @param borrows 借阅信息列表
     * @return Excel文件字节数组
     */
    public static byte[] exportBorrowInfo(List<BorrowInfo> borrows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // 创建工作表
            Sheet sheet = workbook.createSheet("借阅信息表");

            // 设置列宽
            sheet.setColumnWidth(0, 15 * 256); // 借阅ID
            sheet.setColumnWidth(1, 20 * 256); // 教师姓名
            sheet.setColumnWidth(2, 20 * 256); // 部门
            sheet.setColumnWidth(3, 30 * 256); // 期刊名称
            sheet.setColumnWidth(4, 15 * 256); // ISSN
            sheet.setColumnWidth(5, 15 * 256); // 借阅日期
            sheet.setColumnWidth(6, 15 * 256); // 应还日期
            sheet.setColumnWidth(7, 15 * 256); // 归还日期
            sheet.setColumnWidth(8, 15 * 256); // 状态

            // 创建表头行
            Row headerRow = sheet.createRow(0);
            String[] headers = {"借阅ID", "教师姓名", "所在部门", "期刊名称", "ISSN", "借阅日期", "应还日期", "归还日期", "状态"};
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            // 填充数据
            int rowNum = 1;
            for (BorrowInfo borrow : borrows) {
                TeacherInfo teacher = borrow.getBorrower();
                JournalInfo journal = borrow.getJournal();

                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(borrow.getId());
                row.createCell(1).setCellValue(teacher.getName());
                row.createCell(2).setCellValue(teacher.getDepartment());
                row.createCell(3).setCellValue(journal.getName());
                row.createCell(4).setCellValue(journal.getIssn());
                row.createCell(5).setCellValue(borrow.getStartDate().format(DATE_FORMATTER));
                row.createCell(6).setCellValue(borrow.getEndDate().format(DATE_FORMATTER));
                
                // 归还日期（可能为空）
                LocalDate returnDate = borrow.getReturnDate();
                if (returnDate != null) {
                    row.createCell(7).setCellValue(returnDate.format(DATE_FORMATTER));
                }
                
                row.createCell(8).setCellValue(borrow.getStatus());
            }

            // 写入输出流
            workbook.write(outputStream);
            outputStream.flush();
            return outputStream.toByteArray();
        }
    }
}