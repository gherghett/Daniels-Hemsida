import os
import markdown2
from bs4 import BeautifulSoup

# mdinput = open("2023_12_04_Hemsida.md").read()

# html = markdown2.markdown(mdinput)
# print(html)

#output folder

with open("list_group_item_template.html", "r") as file:
    list_group_item_template = file.read()

def create_folders():
    if not os.path.exists("./out"):
    # Create the directory
    os.makedirs(directory)

def generate_list_group_item(title, desc, url):
    html = list_group_item_template
    html = html.replace("{title}", title)
    html = html.replace("{desc}", desc)
    html = html.replace("{url}", url)
    return html

with open("template.html", "r") as file:
    html_template = file.read()

def generate_html():
    return html_template.replace("<!--list-group-->", "\n".join(generate_list()) )

def generate_list():
    items = []
    directory = './articles'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            with open(filepath, "r") as file:
                template = file.read()
            title = template[3:template.index("\n")] #every document should start with a h2 so " ##" 
            desc = template.splitlines()[2] #the first line of the text
            url = filename.split(".")[0]+"html"
            items.append(generate_list_group_item(title, desc, url))
    return items

def generate_articles():
    directory = './articles'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            with open(filepath, "r") as file:
                markdown_input = file.read()
            html = markdown2.markdown(markdown_input)
            output_filename = filename.split(".")[0]+"html"
            with open("./out/art/"+output_filename, "w") as output_file:
                output_file.write(html)
            

generate_articles()
# html = generate_html()

# soup = BeautifulSoup(html, 'html.parser')
# formatted = soup.prettify()
# print(formatted)

# with open("./out/output.html", "w") as output:
#     output.write(formatted)
