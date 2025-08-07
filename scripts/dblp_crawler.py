# Adapted From: Marlon Dias
# coding: utf-8

import math, sys, os, json
import requests
from xml.dom import minidom

from collections import defaultdict

def load_professors_config():
    """从配置文件加载教授列表"""
    config_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dblp', 'professors.json')

    # 默认配置
    default_professors = ['Jiahui Hu', 'Zichen Xu 0001']

    try:
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return set(config.get('professors', default_professors))
        else:
            # 创建默认配置文件
            os.makedirs(os.path.dirname(config_file), exist_ok=True)
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump({'professors': default_professors}, f, indent=2, ensure_ascii=False)
            return set(default_professors)
    except Exception as e:
        print(f"Error loading professors config: {e}")
        return set(default_professors)

# 从配置文件加载教授列表
professors = load_professors_config()
print(f"Loaded {len(professors)} professors: {', '.join(professors)}")

# Get DBLP's key
def get_urlpt(name):
    url = 'http://dblp.uni-trier.de/search/author?xauthor='+name
    response = requests.get(url)
    
    xmldoc = minidom.parseString(response.content)
    item = xmldoc.getElementsByTagName('author')[0]
    
    if item.hasAttribute("urlpt"):
        return item.attributes['urlpt'].value
    
    return None

def list_of_papers(pure_name):
    name = get_urlpt(pure_name)
    
    # In case no URLPT was found
    if name is None:
        return None
    
    url = 'http://dblp.uni-trier.de/pers/xk/'+name+'.xml'
    response = requests.get(url)
    
    xmldoc = minidom.parseString(response.content)
    itemlist = xmldoc.getElementsByTagName('dblpkey')

    papers = []

    for item in itemlist:
        if item.hasAttribute("type"):
            if item.attributes['type'].value == 'person record':
                continue
        rc = []
        for node in item.childNodes:
            if node.nodeType == node.TEXT_NODE:
                rc.append(node.data)
        papers.append(''.join(rc))
    
    return papers

def get_paper_info(paper):
    url = 'http://dblp.uni-trier.de/rec/xml/'+paper+'.xml'
    response = requests.get(url)
    
    xmldoc = minidom.parseString(response.content)
    
    publication_type = paper.split('/')[0]
    
    data = None
    
    if publication_type == 'journals':
        aux = xmldoc.getElementsByTagName('article')
        if len(aux):
            data = treating_journal(xmldoc.getElementsByTagName('article'))
    else:
        if publication_type == 'conf':
            aux = xmldoc.getElementsByTagName('inproceedings')
            if len(aux):
                data = treating_conf(xmldoc.getElementsByTagName('inproceedings'))
            
    return data

# # Extracting info
def treating_conf(itemlist):
    paper_info = defaultdict(lambda:[])
    
    for item in itemlist:
        for author in item.getElementsByTagName('author'):
            paper_info['author'].append(author.firstChild.data)
    
        if item.getElementsByTagName('title'):
            paper_info['title'] = item.getElementsByTagName('title')[0].firstChild.data
            
        if item.getElementsByTagName('pages'):
            paper_info['pages'] = item.getElementsByTagName('pages')[0].firstChild.data
        
        paper_info['year'] = '0'
        if item.getElementsByTagName('year'):
            paper_info['year'] = item.getElementsByTagName('year')[0].firstChild.data
        
        if item.getElementsByTagName('booktitle'):
            paper_info['booktitle'] = item.getElementsByTagName('booktitle')[0].firstChild.data
            
        paper_info['doi'] = ''
        if item.getElementsByTagName('ee'):
            paper_info['doi'] = item.getElementsByTagName('ee')[0].firstChild.data
    
    
    return paper_info

def treating_journal(itemlist):
    paper_info = defaultdict(lambda:[])
    
    for item in itemlist:
        for author in item.getElementsByTagName('author'):
            paper_info['author'].append(author.firstChild.data)
    
        if item.getElementsByTagName('title'):
            paper_info['title'] = item.getElementsByTagName('title')[0].firstChild.data
            
        if item.getElementsByTagName('pages'):
            paper_info['pages'] = item.getElementsByTagName('pages')[0].firstChild.data
        
        paper_info['year'] = '0'
        if item.getElementsByTagName('year'):
            paper_info['year'] = item.getElementsByTagName('year')[0].firstChild.data
        
        if item.getElementsByTagName('journal'):
            paper_info['journal'] = item.getElementsByTagName('journal')[0].firstChild.data
            
        if item.getElementsByTagName('volume'):
            paper_info['volume'] = item.getElementsByTagName('volume')[0].firstChild.data
            
        if item.getElementsByTagName('number'):
            paper_info['number'] = item.getElementsByTagName('number')[0].firstChild.data
            
        paper_info['doi'] = ''
        if item.getElementsByTagName('ee'):
            paper_info['doi'] = item.getElementsByTagName('ee')[0].firstChild.data
    
    
    return paper_info

def print_txt_paper(paper, file_handle):
    """输出论文信息为 TXT 格式"""
    # Authors
    authors_str = ', '.join(paper['author']) + ', '
    file_handle.write(f"Authors: {authors_str}\n")

    # Title
    file_handle.write(f"Title: {paper['title']}\n")

    # Journal or Conference
    if 'booktitle' in paper:
        file_handle.write(f"Booktitle: {paper['booktitle']}\n")
    elif 'journal' in paper:
        file_handle.write(f"Journal: {paper['journal']}\n")
        if 'volume' in paper:
            file_handle.write(f"Volume: {paper['volume']}")
            if 'number' in paper:
                file_handle.write(f", Number: {paper['number']}")
            file_handle.write("\n")

    # Pages
    if 'pages' in paper:
        file_handle.write(f"Pages: {paper['pages']}\n")

    # Year
    file_handle.write(f"Year: {paper['year']}\n")

    # DOI (optional)
    if paper['doi']:
        file_handle.write(f"DOI: {paper['doi']}\n")

    file_handle.write("\n")  # Empty line between papers

# # Collecting info

# List all papers of all professores
# A set is used in order to avoid replicates
papers = set()
for professor in professors:
    paper_list = list_of_papers(professor)
    
    if paper_list is not None:
        papers.update(list_of_papers(professor))
    else:
        print(professor, 'error')

# Papers are sorted according their years of publication
papers_info = defaultdict(lambda:[])
for paper in papers:
    aux = get_paper_info(paper)
    if aux is not None:
        papers_info[int(aux['year'])].append(aux)

# 确保输出目录存在
output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dblp')
os.makedirs(output_dir, exist_ok=True)

# 输出文件路径
output_file = os.path.join(output_dir, 'output.txt')

# 输出论文信息为 TXT 格式，按年份排序（降序）
with open(output_file, 'w', encoding='utf-8') as f:
    for year in sorted(papers_info.keys(), reverse=True):
        papers = papers_info[year]
        f.write(f"{year}\n")
        for paper in papers:
            print_txt_paper(paper, f)

print(f"Successfully exported {sum(len(papers_info[year]) for year in papers_info)} publications to {output_file}")
print("You can now upload this file in the DBLP Import interface.")