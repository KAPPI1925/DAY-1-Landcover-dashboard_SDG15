# 🌍 SDG-15 Land Cover Dashboard (Day-1 | 100 Days Geo Challenge)

An interactive **Web GIS dashboard** visualizing **national land cover (LULC)** statistics using **ESA WorldCover 2021** and **Google Earth Engine**, aligned with **UN SDG-15: Life on Land**.

This project is part of my **100 Days Geospatial Challenge** to build application-oriented, open, and reproducible geospatial tools for research, policy, and sustainability.

🔗 **Live**  
👉 https://kappi1925.projects.earthengine.app/view/sdg-15-national-land-cover-dashboard
---
## 🎯 Project Objectives

- Visualize **national land cover distribution**
- Provide **area and percentage statistics** for SDG-15 indicators
- Build a **fully client-side interactive Web GIS**
- Integrate **Google Earth Engine + Leaflet + Chart.js**
- Publish as an **open-access GitHub Pages application**

---
## 🛰️ Data Sources

- **ESA WorldCover 2021**  
  Global land cover map at **10 m resolution**

- **Google Earth Engine (GEE)**  
  Used for:
  - LULC processing
  - Area statistics computation
  - Map tile generation

- **OpenStreetMap (OSM)**  
  Base map layer

---
## 🧩 Technologies Used

| Category              | Tools                 |
| --------------------- | --------------------- |
| Geospatial Processing | Google Earth Engine   |
| Web Mapping           | Leaflet.js            |
| Visualization         | Chart.js              |
| Frontend              | HTML, CSS, JavaScript |
| Hosting               | GitHub Pages          |

---
## ✨ Key Features

✔ Interactive LULC map (ESA WorldCover)  
✔ Clickable legend for **class-wise filtering**  
✔ **Dynamic area & percentage statistics**  
✔ **Pie chart synchronized** with map & legend  
✔ **Bottom sliding panel** (open / close)  
✔ **Responsive mobile layout**  
✔ Custom attribution & branding  
✔ Fully static deployment (no backend)

---
## 📊 Land Cover Classes (ESA WorldCover)

- Tree cover  
- Shrubland  
- Grassland  
- Cropland  
- Built-up  
- Bare / sparse vegetation  
- Snow & ice  
- Permanent water bodies  
- Herbaceous wetlands  
- Mangroves  
- Moss & lichen  

---
## 📐 SDG-15 Relevance

This dashboard supports:
- **Monitoring land cover composition**
- **Assessing ecosystem extent**
- **Understanding human pressure (built-up expansion)**
- **Baseline inputs for SDG-15 indicators**

Suitable for:
- Researchers
- Students
- Policy analysts
- Environmental planners

---
## 🚀 How to Run Locally

`git clone https://github.com/kappi1925/DAY-1-Landcover-dashboard_SDG15.git cd DAY-1-Landcover-dashboard_SDG15`

Then open `index.html` using a local server:

`python -m http.server`

---
## 👨‍💻 Author

**Kamalesh Kanna S**  
_Postdoctoral Researcher | Geospatial Scientist | Remote Sensing & GeoAI_

🌐 **GitHub Pages**  
👉 [https://kappi1925.github.io/](https://kappi1925.github.io/)

🐙 **GitHub**  
👉 [https://github.com/kappi1925](https://github.com/kappi1925)

💼 **LinkedIn**  
👉 https://www.linkedin.com/in/kamalesh-kanna-s/

📸 **Instagram**  
👉 https://www.instagram.com/kamaleshkanna_s/

📺 **YouTube**  
👉 https://www.youtube.com/@mydesktoptech

---
## 📜 License

This project is released under the **MIT License**.  
You are free to use, modify, and distribute with attribution.

---
## 🔮 Future Enhancements

- Multi-country selection
    
- Time-series land cover comparison
    
- Downloadable reports (PDF/PNG)
    
- SDG indicator automation
    
- Integration with additional datasets (MODIS, Copernicus)

---
## ⭐ Acknowledgements

- ESA WorldCover Team
    
- Google Earth Engine Team
    
- OpenStreetMap Contributors

⭐ If you find this project useful, please **star the repository** and share it!

---
## 🏁 You’ve Officially Completed Day-1 🏆

This README positions you as:
- A **GeoWeb developer**
- A **research-oriented GIS professional**
- Someone who builds **real, shareable applications**

👉 **Tomorrow (Day-2)** we can:
- Add **country dropdown**
- Compare **ESA vs MODIS**
- Add **change detection**
- Or move into **GeoAI**

Just say *“Day-2”* when ready 👌

---
## 📁 Repository Structure

```text
├── index.html
├── style.css
├── script.js
├── data/
│   └── India_SDG15_LULC_FINAL.geojson
└── README.md
