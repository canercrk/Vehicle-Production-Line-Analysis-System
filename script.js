// Makro değişkenler
Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#4a5568';

// Sayfa yüklendiğinde analizi başlat
window.onload = initializeAnalysis;

// Analiz sonuçlarını tutacak değişken
let analysisResults = null;

// Analiz modelleri

// Analizi başlat
async function initializeAnalysis() {
    try {
        // Python'dan analiz sonuçlarını al
        await fetchAnalysisResults();
        
        // Sonuçları görselleştir
        displayResults();
    } catch (error) {
        console.error('Analiz sırasında bir hata oluştu:', error);
        document.getElementById('error-message').textContent = 
            'Analiz sonuçları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya sorunu bildirin.';
        document.getElementById('error-container').style.display = 'block';
    }
}

// Analiz sonuçlarını al
async function fetchAnalysisResults() {
    try {
        // Python'ın oluşturduğu JSON dosyasından verileri yükle
        const response = await fetch('analysis_results.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // JSON verisini çözümle
        analysisResults = await response.json();
        
        console.log('Analiz sonuçları başarıyla yüklendi.');
    } catch (error) {
        console.error('Analiz sonuçlarını yüklerken hata oluştu:', error);
        throw error;
    }
}

// Sonuçları görselleştir
function displayResults() {
    if (!analysisResults) return;
    
    // Temel istatistikleri göster
    document.getElementById('totalVehicles').textContent = analysisResults.basic_stats.total_vehicles;
    document.getElementById('totalOperations').textContent = analysisResults.basic_stats.total_operations;
    document.getElementById('avgTime').textContent = analysisResults.basic_stats.avg_time;
    document.getElementById('bottleneckOp').textContent = analysisResults.basic_stats.bottleneck_op;
    
    // Operasyon grafiğini oluştur
    createOperationChart();
    
    // Araç grafiğini oluştur
    createVehicleChart();
    
    // Darboğaz grafiğini oluştur
    createBottleneckChart();
    
    // Dağılım grafiğini oluştur
    createDistributionChart();
    
    // Detay tablosunu doldur
    populateDetailTable();
    
    // Önerileri göster
    showRecommendations();
    
    // Gelişmiş analiz bölümlerini doldur
    populateAdvancedAnalysis();
    
    // Hata ayıklama
    console.log("Analiz sonuçları başarıyla görüntülendi.");
}

// Değer aralığına göre renk üreten yardımcı fonksiyon - YUMUŞAK GEÇİŞLİ
function getColorByValue(value, min, max) {
    // Değeri 0-1 aralığına normalize et
    const normalizedValue = (value - min) / (max - min);
    
    // Renk geçişlerini tanımla (kırmızı -> sarı -> yeşil)
    if (normalizedValue > 0.7) {
        // Kırmızı tonları (0.7-1.0 arası)
        const intensity = (normalizedValue - 0.7) / 0.3; // 0-1 arası
        return `rgb(255, ${Math.round(105 + (1-intensity) * 80)}, ${Math.round(100 * (1-intensity))})`;
    } 
    else if (normalizedValue > 0.3) {
        // Sarı tonları (0.3-0.7 arası)
        const intensity = (normalizedValue - 0.3) / 0.4; // 0-1 arası
        return `rgb(255, ${Math.round(185 - intensity * 0)}, ${Math.round(100 - intensity * 100)})`;
    }
    else {
        // Yeşil tonları (0.0-0.3 arası)
        const intensity = normalizedValue / 0.3; // 0-1 arası
        return `rgb(${Math.round(120 + intensity * 135)}, 220, ${Math.round(120 - intensity * 20)})`;
    }
}

// Araç grafiğini oluştur - Görseldeki gibi dinamik renklendirmeli
function createVehicleChart() {
    const ctx = document.getElementById('vehicleChart').getContext('2d');
    const data = analysisResults.vehicle_chart_data;
    
    if (!data || !data.data || data.data.length === 0) {
        console.warn("Vehicle chart data is missing or empty");
        return;
    }
    
    // Verileri süreye göre küçükten büyüğe sırala (PRESTIJ en üstte)
    const sortedLabelsAndData = [];
    for (let i = 0; i < data.labels.length; i++) {
        if (data.data[i] && !isNaN(data.data[i])) {
            sortedLabelsAndData.push({
                label: data.labels[i],
                value: data.data[i]
            });
        }
    }
    
    // Sıralama fonksiyonunu tersine çevirdik (a.value - b.value)
    sortedLabelsAndData.sort((a, b) => a.value - b.value);
    
    const sortedLabels = sortedLabelsAndData.map(item => item.label);
    const sortedData = sortedLabelsAndData.map(item => item.value);
    
    // Verilerin min, max değerlerini bul (yalnızca pozitif değerleri hesaba kat)
    const values = sortedData.filter(val => !isNaN(val) && val > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Her araç için yumuşak geçişli renk üret
    const backgroundColors = sortedData.map(value => 
        getColorByValue(value, minValue, maxValue)
    );
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Ortalama Süre (saat)',
                data: sortedData,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'right', // Çubuğun sonuna hizala
                    formatter: function(value) {
                        return value.toFixed(1); // Sadece sayı
                    },
                    font: {
                        weight: 'normal' // Kalın değil
                    },
                    color: '#4a5568' // Grafik yazı rengiyle aynı
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ortalama Süre (saat)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Operasyon grafiğini oluştur - Görseldeki gibi dinamik renklendirmeli
function createOperationChart() {
    const ctx = document.getElementById('operationChart').getContext('2d');
    const data = analysisResults.operation_chart_data;
    
    if (!data || !data.data || data.data.length === 0) {
        console.warn("Operation chart data is missing or empty");
        return;
    }
    
    // Verilerin min, max değerlerini bul
    const values = data.data.filter(val => !isNaN(val) && val > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Y ekseni üst limiti: en yüksek değerin %20 fazlası, en yakın 10'a aşağı yuvarla
    const yMax = Math.floor((maxValue * 1.2) / 10) * 10;

    // Her operasyon için yumuşak geçişli renk üret
    const backgroundColors = data.data.map(value => 
        getColorByValue(value, minValue, maxValue)
    );
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Ortalama Süre',
                data: data.data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end', // Çubuğun üstüne hizala
                    align: 'top',  // Üste hizala
                    offset: -4,    // Biraz yukarı taşı
                    formatter: function(value) {
                        return value.toFixed(1);
                    },
                    font: {
                        weight: 'normal',
                        size: 12
                    },
                    color: '#4a5568'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax, // Y ekseni üst limiti burada!
                    title: { display: true, text: 'Saat' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Darboğaz grafiğini oluştur - Her işlem için farklı renk ve legend ile
function createBottleneckChart() {
    const ctx = document.getElementById('bottleneckChart').getContext('2d');
    const data = analysisResults.bottleneck_chart_data;
    
    if (!data || !data.data || data.data.length === 0) {
        console.warn("Bottleneck chart data is missing or empty");
        return;
    }
    /*
     '#FF6B6B', // Kırmızı - ŞASE ELEKTRİK
        '#4ECDC4', // Teal - DÖŞEME  
        '#45B7D1', // Mavi - KLİMA
        '#96CEB4', // Yeşil - TRİM ELEKTRİK
        '#FECA57', // Sarı - SEPETLİK
        '#FF9FF3', // Pembe - CAM
        '#54A0FF', // Açık mavi - İÇ TRİM
        '#5F27CD', // Mor - DIŞ TRİM
        '#00D2D3', // Cyan
        '#FF9F43', // Turuncu
        '#10AC84', // Koyu yeşil
        '#EE5A24'  // Koyu turuncu
        [
  '#1DD1A1', // Nane yeşili
  '#2E86DE', // Koyu mavi
  '#341F97', // Gece moru
  '#F368E0', // Parlak pembe
  '#576574', // Füme / gri
  '#A3CB38', // Limon yeşili
  '#8395A7', // Açık gri-mavi
  '#222F3E', // Lacivert-siyah
  '#C4E538', // Neon yeşil
  '#FDA7DF', // Açık pembe
  '#12CBC4', // Parlak turkuaz
  '#B53471', // Koyu fuşya
  '#D980FA', // Lila
  '#833471', // Patlıcan moru
  '#F79F1F', // Altın turuncu
  '#E58E26', // Kehribar turuncu
  '#ED4C67', // Mercan kırmızı
  '#F8EFBA', // Krem
  '#009432', // Zümrüt yeşili
  '#6F1E51'  // Şarap kırmızısı
]

    */
    // Her işlem için farklı renk paleti
    const colors = [
        '#341F97', // Kırmızı - ŞASE ELEKTRİK
        '#F368E0', // Teal - DÖŞEME  
        '#B53471', // Mavi - KLİMA
        '#6F1E51', // Yeşil - TRİM ELEKTRİK
        '#D980FA', // Sarı - SEPETLİK
        '#FF9FF3', // Pembe - CAM
        '#54A0FF', // Açık mavi - İÇ TRİM
        '#5F27CD', // Mor - DIŞ TRİM
        '#00D2D3', // Cyan
        '#FF9F43', // Turuncu
        '#10AC84', // Koyu yeşil
        '#EE5A24'  // Koyu turuncu
    ];
    
    // Her işlem için ayrı dataset oluştur
    const datasets = data.data.map((item, index) => ({
        label: item.label, // İşlem adı
        data: [{
            x: item.x,
            y: item.y
        }],
        backgroundColor: colors[index % colors.length] + 'CC', // %80 şeffaflık
        borderColor: colors[index % colors.length],
        borderWidth: 1,
        pointRadius: 10 ,
        pointHoverRadius: 15
    }));
    
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 12,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        boxWidth: 8,
                        boxHeight: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const x = context.parsed.x.toFixed(1);
                            const y = context.parsed.y.toFixed(1);
                            return `${context.dataset.label}: Ort: ${x}, Max: ${y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Ortalama Süre (saat)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Maksimum Süre (saat)'
                    }
                }
            }
        }
    });
}

// Dağılım grafiğini oluştur
function createDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    const data = analysisResults.distribution_chart_data;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'İşlem Sayısı',
                data: data.data,
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 1,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'İşlem Sayısı'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Süre Aralığı (saat)'
                    }
                }
            }
        }
    });
}

// Detay tablosunu doldur
function populateDetailTable() {
    const tableBody = document.getElementById('detailTable').querySelector('tbody');
    tableBody.innerHTML = '';
    
    // Verileri önce sırala: darboğazlar en üstte ve varyasyona göre sıralı olsun
    const sortedData = [...analysisResults.detail_table_data].sort((a, b) => {
        // Önce darboğaz durumuna göre sırala
        if (a.is_bottleneck && !b.is_bottleneck) return -1;
        if (!a.is_bottleneck && b.is_bottleneck) return 1;
        
        // İkisi de darboğaz veya ikisi de değilse varyasyona göre sırala (büyükten küçüğe)
        return b.variance - a.variance;
    });
    
    sortedData.forEach(row => {
        const tr = document.createElement('tr');
        if (row.is_bottleneck) tr.classList.add('bottleneck');
        if (row.is_efficient) tr.classList.add('efficient');
        
        tr.innerHTML = `
            <td>${row.operation}</td>
            <td>${row.fastest_vehicle}</td>
            <td>${row.slowest_vehicle}</td>
            <td>${row.variance}</td>
            <td>${row.avg}</td>
            <td>${row.status}</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// Önerileri göster
function showRecommendations() {
    const recList = document.getElementById('recommendationsList');
    recList.innerHTML = '';
    
    analysisResults.recommendations.forEach(rec => {
        recList.innerHTML += `
            <div class="rec-item">
                ${rec.text}
            </div>
        `;
    });
}

// Gelişmiş analiz bölümlerini doldur
function populateAdvancedAnalysis() {
    // İnteraktif darboğaz simülasyonunu göster
    setupInteractiveBottleneckSimulation();
}


