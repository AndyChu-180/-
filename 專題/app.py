from flask import Flask, render_template, url_for, request
import pandas as pd
from configparser import ConfigParser
import os

# Config Parser
config = ConfigParser()
config.read("config.ini")

os.environ["GOOGLE_API_KEY"] = config["Gemini"]["API_KEY"]
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-pro")

app = Flask(__name__)

@app.route('/')
def formPage():
    try:
        # 读取本地的 chartdata.csv 文件
        df = pd.read_csv("chartdata.csv", encoding="utf-8")  # 尝试使用 utf-8 编码
        print(df.head())  # 打印前几行数据检查
        # 数据处理
        df = df.fillna('')  # 填充空值
        df.columns = ["z", "a", "b", "c", "d", "e", "f", "g", "p", "male", "female"]
        result = df.to_json(orient="records")
        
        # 将 JSON 格式的数据传递给 HTML 模板
        return render_template("index.html", Titanic=result)
    except Exception as e:
        print(f"Error: {e}")
        return f"An error occurred: {e}"

@app.route("/call_llm", methods=["POST"])
def call_llm():
    if request.method == "POST":
        print("POST!")
        data = request.form
        print(data)
        try:
            result = llm.invoke("請用不超過 15 字的話提示主角與角色互動")
            return result.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return f"An error occurred: {e}"

if __name__ == '__main__':
    app.run(debug=True)
