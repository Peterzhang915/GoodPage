import csv
import sys
import os

# --- 配置 ---
# 使用相对路径，假设脚本从 GoodPage 目录的上层 (GoodLab) 运行
# 或者更健壮地，使用脚本自身的路径来定位 CSV
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(script_dir, '../prisma/initcsv/Member.csv')
# 图片文件实际存放的基础目录 (用于潜在的文件检查，但此脚本默认不检查)
# image_base_dir = os.path.join(script_dir, '../public/avatars')
placeholder_avatar = '/avatars/placeholder.png'
# 假设图片 ID 来自 'id' 列
id_column_name = 'id'
avatar_column_name = 'avatar_url'
# *** 重要: 修改为你图片实际使用的后缀名 (.png, .jpeg, etc.) ***
image_extension = '.jpg'
# --- 配置结束 ---

try:
    # 确保CSV文件路径存在
    if not os.path.exists(csv_file_path):
        print(f"错误：找不到CSV文件: {csv_file_path}", file=sys.stderr)
        print(f"请确保脚本位于 GoodPage/scripts 目录下，并且 CSV 文件位于 GoodPage/prisma/initcsv/Member.csv", file=sys.stderr)
        sys.exit(1)

    output_rows = []
    header = []

    # --- 读取和处理数据 ---
    with open(csv_file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile, delimiter=',', quotechar='"')
        header = next(reader) # 读取标题行
        output_rows.append(header)

        try:
            id_col_index = header.index(id_column_name)
            avatar_col_index = header.index(avatar_column_name)
        except ValueError as e:
            print(f"错误：在CSV标题中找不到列 '{e}'", file=sys.stderr)
            sys.exit(1)

        for row in reader:
            # 复制原始行以避免修改迭代中的对象
            new_row = list(row)
            if len(new_row) > max(id_col_index, avatar_col_index): # 确保行有足够列
                current_avatar = new_row[avatar_col_index]
                member_id = new_row[id_col_index]

                if current_avatar == placeholder_avatar and member_id:
                    # 构造新的头像 URL
                    new_avatar_url = f"/avatars/{member_id}{image_extension}"
                    new_row[avatar_col_index] = new_avatar_url
                    # 可选：检查文件是否存在 (取消注释下一行以启用)
                    # image_path = os.path.join(image_base_dir, f"{member_id}{image_extension}")
                    # if not os.path.exists(image_path):
                    #     print(f"警告：成员 '{member_id}' 的图片文件 {new_avatar_url} 未在预期位置 {image_path} 找到。", file=sys.stderr)

            output_rows.append(new_row) # 添加处理后的行（或原始行）

    # --- 将结果写回原始文件 ---
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
        writer.writerows(output_rows)

    print(f"成功更新文件: {csv_file_path}", file=sys.stderr)


except FileNotFoundError:
    print(f"错误：尝试打开文件时出错 {csv_file_path}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"处理过程中发生错误: {e}", file=sys.stderr)
    sys.exit(1)

# 不再打印到标准输出，避免干扰CSV输出
# print("
# 脚本执行完毕。输出已打印到标准输出。", file=sys.stderr) 