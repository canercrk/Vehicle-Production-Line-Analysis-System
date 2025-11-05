// Hata mesajlarını göstermek için yardımcı fonksiyon
function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
        errorContainer.style.display = 'block';
        
        // Yapılandırma dosyasından hata mesajı süresini al
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, CONFIG.uiSettings.errorMessageTimeout);
        
        // Sayfayı hata mesajına doğru kaydır
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// İnteraktif darboğaz simülasyonu için fonksiyonlar
function setupInteractiveBottleneckSimulation() {
    const container = document.getElementById('interactiveBottleneckSimulation');
    if (!container) return;
    
    // Simülasyon kontrol panelini oluştur
    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h4>İnteraktif Darboğaz İyileştirme Simülasyonu</h4>
            </div>
            <div class="card-body">
                <p class="lead">İyileştirmek istediğiniz işlemi ve iyileştirme yüzdesini seçerek potansiyel etkiyi görebilirsiniz.</p>
                
                <form id="bottleneckSimulationForm" class="mb-4">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <label for="operationSelect" class="form-label">İyileştirmek İstediğiniz İşlem:</label>
                            <select id="operationSelect" class="form-select">
                                ${Object.keys(analysisResults.raw_data).map(op => 
                                    `<option value="${op}" ${op === analysisResults.basic_stats.bottleneck_op ? 'selected' : ''}>${op}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="col-md-4">
                            <label for="improvementPercentage" class="form-label">İyileştirme Yüzdesi (%):</label>
                            <input type="range" class="form-range" id="improvementPercentage" 
                                min="${CONFIG.simulationParams.minImprovementPercentage}" 
                                max="${CONFIG.simulationParams.maxImprovementPercentage}" 
                                step="${CONFIG.simulationParams.improvementStep}" 
                                value="${CONFIG.simulationParams.defaultImprovementPercentage}">
                            <div class="d-flex justify-content-between">
                                <small>${CONFIG.simulationParams.minImprovementPercentage}%</small>
                                <small id="currentPercentage">${CONFIG.simulationParams.defaultImprovementPercentage}%</small>
                                <small>${CONFIG.simulationParams.maxImprovementPercentage}%</small>
                            </div>
                        </div>
                        
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary w-100">
                                Simülasyonu Çalıştır
                            </button>
                        </div>
                    </div>
                </form>
                
                <!-- Finansal parametreler -->
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">
                            <button class="btn btn-link text-decoration-none text-white" type="button" data-bs-toggle="collapse" data-bs-target="#financialParams">
                                Finansal Parametreler
                            </button>
                        </h5>
                    </div>
                    <div id="financialParams" class="collapse">
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="hourlyLaborCost" class="form-label">İşçilik Maliyeti (TL/saat):</label>
                                    <input type="number" class="form-control" id="hourlyLaborCost" 
                                           placeholder="İşçilik maliyeti giriniz"
                                           value="${CONFIG.financialParams.hourlyLaborCost}">
                                </div>
                                <div class="col-md-4">
                                    <label for="dailyProduction" class="form-label">Günlük Üretim (araç/gün):</label>
                                    <input type="number" class="form-control" id="dailyProduction" 
                                           placeholder="Günlük üretim miktarı giriniz"
                                           value="${CONFIG.financialParams.dailyProduction}">
                                </div>
                                <div class="col-md-4">
                                    <label for="annualWorkingDays" class="form-label">Yıllık Çalışma Günü:</label>
                                    <input type="number" class="form-control" id="annualWorkingDays" 
                                           placeholder="Yıllık çalışma günü giriniz"
                                           value="${CONFIG.financialParams.annualWorkingDays}">
                                </div>
                                <div class="col-12">
                                    <label for="investmentCostMultiplier" class="form-label">
                                        Yatırım Maliyeti Çarpanı (% iyileştirme başına bin TL):
                                    </label>
                                    <input type="number" class="form-control" id="investmentCostMultiplier" 
                                           placeholder="Yatırım maliyet çarpanı giriniz"
                                           value="${CONFIG.financialParams.investmentCostMultiplier}">
                                    <small class="text-muted">
                                        Örnek: 100 değeri, %10 iyileştirme için 10.000 TL yatırım maliyeti demektir.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Simülasyon sonuçları burada gösterilecek -->
                <div id="simulationResults"></div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Yüzde göstergesini güncelle
    const percentageSlider = document.getElementById('improvementPercentage');
    const percentageDisplay = document.getElementById('currentPercentage');
    
    percentageSlider.addEventListener('input', function() {
        percentageDisplay.textContent = `${this.value}%`;
    });
    
    // Form gönderimini izle
    const simulationForm = document.getElementById('bottleneckSimulationForm');
    simulationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const operation = document.getElementById('operationSelect').value;
        const percentage = parseInt(document.getElementById('improvementPercentage').value);
        
        // Finansal parametreleri al
        const hourlyLaborCost = parseFloat(document.getElementById('hourlyLaborCost').value);
        const dailyProduction = parseInt(document.getElementById('dailyProduction').value);
        const annualWorkingDays = parseInt(document.getElementById('annualWorkingDays').value);
        const investmentCostMultiplier = parseFloat(document.getElementById('investmentCostMultiplier').value);
        
        // Simülasyon parametrelerini hazırla
        const simulationParams = {
            operation,
            percentage,
            financialParams: {
                hourlyLaborCost,
                dailyProduction,
                annualWorkingDays,
                investmentCostMultiplier
            }
        };
        
        // Client-side simülasyon yap
        const simulationResults = clientSideSimulation(
            analysisResults.raw_data, 
            analysisResults.vehicles, 
            operation, 
            percentage, 
            simulationParams.financialParams
        );
        
        // Simülasyon sonuçlarını göster
        displaySimulationResults(simulationResults);
    });
}

// Araç karışım oranlarını al
function getVehicleProductionRatio(vehicleName) {
    // Eğer config'de tanımlıysa onu kullan, yoksa eşit dağıtım
    if (CONFIG.productionMixRatios && CONFIG.productionMixRatios[vehicleName]) {
        return CONFIG.productionMixRatios[vehicleName];
    }
    // Varsayılan: eşit dağıtım
    return 1 / analysisResults.vehicles.length;
}

// Client-side simülasyon fonksiyonu
function clientSideSimulation(rawData, vehicles, operation, percentage, financialParams) {
    // Veriyi temizle - nan değerleri kaldır
    const data = {};
    for (const op in rawData) {
        data[op] = rawData[op].map(time => time === 0 ? NaN : time);
    }
    
    // İyileştirilmiş veriyi oluştur
    const improvedData = {};
    for (const op in data) {
        if (op === operation) {
            improvedData[op] = data[op].map(time => 
                !isNaN(time) && time > 0 ? time * (1 - percentage/100) : time
            );
        } else {
            improvedData[op] = [...data[op]];
        }
    }
    
    // Araç bazlı sonuçları hesapla
    const vehicleResults = [];
    
    for (let i = 0; i < vehicles.length; i++) {
        // Orijinal toplam süre
        let beforeTotal = 0;
        let validBefore = true;
        const operationsTimeBefore = {};
        
        for (const op in data) {
            if (i < data[op].length && !isNaN(data[op][i]) && data[op][i] > 0) {
                beforeTotal += data[op][i];
                operationsTimeBefore[op] = data[op][i];
            } else {
                validBefore = false; // Eksik veri
            }
        }
        
        // İyileştirilmiş toplam süre
        let afterTotal = 0;
        let validAfter = true;
        const operationsTimeAfter = {};
        
        for (const op in improvedData) {
            if (i < improvedData[op].length && !isNaN(improvedData[op][i]) && improvedData[op][i] > 0) {
                afterTotal += improvedData[op][i];
                operationsTimeAfter[op] = improvedData[op][i];
            } else {
                validAfter = false;
            }
        }
        
        // Eğer her iki durumda da geçerli veriler varsa listeye ekle
        if (validBefore && validAfter) {
            vehicleResults.push({
                vehicle: vehicles[i],
                beforeTotal: beforeTotal.toFixed(1),
                afterTotal: afterTotal.toFixed(1),
                timeSavings: (beforeTotal - afterTotal).toFixed(1),
                percentageSavings: ((beforeTotal - afterTotal) / beforeTotal * 100).toFixed(1),
                operationsBefore: operationsTimeBefore,
                operationsAfter: operationsTimeAfter
            });
        }
    }
    
    // Ortalama değerler
    const beforeTimes = vehicleResults.map(r => parseFloat(r.beforeTotal));
    const afterTimes = vehicleResults.map(r => parseFloat(r.afterTotal));
    
    const beforeAvg = beforeTimes.reduce((sum, time) => sum + time, 0) / beforeTimes.length;
    const afterAvg = afterTimes.reduce((sum, time) => sum + time, 0) / afterTimes.length;
    const timeSavings = beforeAvg - afterAvg;
    const percentageSavings = (timeSavings / beforeAvg * 100);
    
    // Finansal etki hesapla - YENİ YAKLAŞIM
    const { hourlyLaborCost, dailyProduction, annualWorkingDays, investmentCostMultiplier } = financialParams;
    
    // ARAÇ BAZLI TOPLAMI KULLAN
    let totalAnnualTimeSavings = 0;
    
    vehicleResults.forEach(vehicle => {
        const vehicleTimeSavings = parseFloat(vehicle.timeSavings);
        const vehicleProductionRatio = getVehicleProductionRatio(vehicle.vehicle);
        const annualVehicleProduction = dailyProduction * vehicleProductionRatio * annualWorkingDays;
        
        let vehicleAnnualTimeSavings = vehicleTimeSavings * annualVehicleProduction;
        
        // Azalan getiri her araç için ayrı uygula
        if (percentage > 25) {
            const adjustmentFactor = Math.pow(0.95, (percentage - 25) / 10);
            vehicleAnnualTimeSavings *= adjustmentFactor;
        }
        
        totalAnnualTimeSavings += vehicleAnnualTimeSavings;
    });
    
    // Finansal etkiyi araç bazlı toplamdan hesapla
    const annualTimeSavings = totalAnnualTimeSavings;
    const annualCostSavings = annualTimeSavings * hourlyLaborCost;
    
    // Yatırım maliyeti - %10'dan sonra artan maliyet eğrisi
    let estimatedInvestment;
    
    if (percentage <= 20) {
        estimatedInvestment = percentage * investmentCostMultiplier * 1000; // %10'a kadar doğrusal
    } else {
        // %10'dan sonra artan maliyet eğrisi
        const baseCost = 20 * investmentCostMultiplier * 1000; // %10 için baz maliyet
        const increaseFactor = 1.10; // Her %10 artışta ek maliyet faktörü
        
        // %10'dan sonraki her adım için üstel artan maliyet hesapla
        const additionalPercentage = percentage - 20;
        const growthMultiplier = Math.pow(increaseFactor, additionalPercentage / 10);
        
        estimatedInvestment = baseCost * (1 + additionalPercentage / 10 * growthMultiplier);
    }
    
    // Sıfıra bölünme kontrolü
    const paybackPeriod = annualCostSavings > 0 ? estimatedInvestment / annualCostSavings : Infinity;
    const fiveYearRoi = estimatedInvestment > 0 ? 
        (annualCostSavings * 5 - estimatedInvestment) / estimatedInvestment * 100 : 0;
    
    // En çok fayda sağlayan araçları sırala
    vehicleResults.sort((a, b) => parseFloat(b.timeSavings) - parseFloat(a.timeSavings));
    
    return {
        operation,
        improvementPercentage: percentage,
        beforeAvgTotal: beforeAvg.toFixed(1),
        afterAvgTotal: afterAvg.toFixed(1),
        timeSavings: timeSavings.toFixed(1),
        percentageSavings: percentageSavings.toFixed(1),
        vehicleResults,
        topBenefitedVehicles: vehicleResults.slice(0, 3),
        financialImpact: {
            hourlyLaborCost,
            annualTimeSavings: isFinite(annualTimeSavings) ? annualTimeSavings.toFixed(1) : "0.0",
            annualCostSavings: Math.round(annualCostSavings),
            estimatedInvestment: Math.round(estimatedInvestment),
            paybackPeriod: isFinite(paybackPeriod) ? paybackPeriod.toFixed(1) : "-",
            fiveYearRoi: isFinite(fiveYearRoi) ? fiveYearRoi.toFixed(1) : "0.0"
        }
    };
}

// İyileştirme Senaryoları Karşılaştırması kaldırıldı

// Simülasyon sonuçlarını görüntüle
function displaySimulationResults(results) {
    const container = document.getElementById('simulationResults');
    if (!container) return;
    
    let html = `
        <div class="simulation-results">
            <h4 class="mt-4">Simülasyon Sonuçları: ${results.operation} (${results.improvementPercentage}% İyileştirme)</h4>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Zaman Tasarrufu</h5>
                            <p class="display-6">${results.timeSavings} saat</p>
                            <p class="text-muted">Araç başına ortalama</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Ortalama İyileşme</h5>
                            <p class="display-6">${results.percentageSavings}%</p>
                            <p class="text-muted">Toplam sürede azalma</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Yatırım Geri Dönüşü</h5>
                            <p class="display-6">${results.financialImpact.paybackPeriod === "-" ? 
                                "-" : results.financialImpact.paybackPeriod + " yıl"}</p>
                            <p class="text-muted">Geri ödeme süresi</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Finansal etki -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5>Finansal Etki</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th>Yıllık Zaman Tasarrufu:</th>
                                        <td>${results.financialImpact.annualTimeSavings} saat</td>
                                    </tr>
                                    <tr>
                                        <th>Yıllık Maliyet Tasarrufu:</th>
                                        <td>${parseInt(results.financialImpact.annualCostSavings).toLocaleString()} TL</td>
                                    </tr>
                                    <tr>
                                        <th>Tahmini Yatırım:</th>
                                        <td>${parseInt(results.financialImpact.estimatedInvestment).toLocaleString()} TL</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th>Geri Ödeme Süresi:</th>
                                        <td>${results.financialImpact.paybackPeriod} yıl</td>
                                    </tr>
                                    <tr>
                                        <th>5 Yıllık ROI:</th>
                                        <td>${results.financialImpact.fiveYearRoi}%</td>
                                    </tr>
                                    <tr>
                                        <th>İşçilik Maliyeti:</th>
                                        <td>${results.financialImpact.hourlyLaborCost} TL/saat</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Araç bazlı etki -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5>En Çok Fayda Sağlayan Araçlar</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${results.topBenefitedVehicles.map(vehicle => {
                            // Her araç için yıllık zaman tasarrufunu hesapla (undefined olmamasını sağla)
                            const vehicleTimeSavings = parseFloat(vehicle.timeSavings) || 0;
                            
                            // Simülasyonun financialImpact nesnesinden doğrudan değerleri al
                            // hourlyLaborCost, dailyProduction ve annualWorkingDays simülasyon sonuçlarında mevcut
                            const dailyProduction = parseInt(document.getElementById('dailyProduction').value);
                            const annualWorkingDays = parseInt(document.getElementById('annualWorkingDays').value);
                            const hourlyLaborCost = parseFloat(document.getElementById('hourlyLaborCost').value);
                            
                            const vehicleProductionRatio = getVehicleProductionRatio(vehicle.vehicle);
                            const dailyVehicleProduction = dailyProduction * vehicleProductionRatio;
                            const annualVehicleProduction = dailyVehicleProduction * annualWorkingDays;

                            let vehicleAnnualTimeSavings = vehicleTimeSavings * annualVehicleProduction;
                            const currentPercentage = parseInt(document.getElementById('improvementPercentage').value);
                            if (currentPercentage > 20) {
                                const adjustmentFactor = Math.pow(0.95, (currentPercentage - 20) / 10);
                                vehicleAnnualTimeSavings *= adjustmentFactor;
                            }
                            
                            const vehicleAnnualCostSavings = Math.round(vehicleAnnualTimeSavings * hourlyLaborCost).toLocaleString();
                            
                            return `
                            <div class="col-md-4 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">${vehicle.vehicle}</h5>
                                        <p class="card-text">
                                            <div class="info-row">
                                                <span class="info-label">Önceki Süre:</span>
                                                <span class="info-value">${vehicle.beforeTotal} saat</span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Yeni Süre:</span>
                                                <span class="info-value">${vehicle.afterTotal} saat</span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Tasarruf:</span>
                                                <span class="info-value">${vehicle.timeSavings} saat (${vehicle.percentageSavings}%)</span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Yıllık Zaman Tasarrufu:</span>
                                                <span class="info-value">${vehicleAnnualTimeSavings.toLocaleString()} saat</span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Yıllık Maliyet Tasarrufu:</span>
                                                <span class="info-value">${vehicleAnnualCostSavings} TL</span>
                                            </div>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Grafik -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5>İyileştirme Grafiği</h5>
                    <div class="text-muted small">En çok tasarruf sağlanan araçlar gösterilmektedir. Grafiğin üzerine gelerek detaylı bilgi alabilirsiniz.</div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> Bu grafikte, ${results.operation} işlemindeki %${results.improvementPercentage} iyileştirmenin araç bazında etkileri gösterilmektedir. 
                                Mavi çubuklar iyileştirme öncesi süreyi, yeşil çubuklar iyileştirme sonrası süreyi, kırmızı çizgi ise tasarruf yüzdesini gösterir.
                            </div>
                        </div>
                    </div>
                    <div style="height: 400px;">
                        <canvas id="simulationChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Tüm Araçlar Tablosu -->
            <div class="card">
                <div class="card-header">
                    <h5>Tüm Araç Sonuçları (Yıllık Maliyet Tasarrufuna Göre Sıralı)</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr class="table-primary">
                                    <th>Araç</th>
                                    <th>Önceki Süre (saat)</th>
                                    <th>Yeni Süre (saat)</th>
                                    <th>Tasarruf (saat)</th>
                                    <th>Tasarruf (%)</th>
                                    <th>Yıllık Tasarruf (saat)</th>
                                    <th>Yıllık Maliyet Tasarrufu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.vehicleResults
                                    // Önce maliyet tasarruflarını hesaplayalım
                                    .map(vehicle => {
                                        // Her araç için yıllık zaman ve maliyet tasarrufunu hesapla
                                        const dailyProduction = parseInt(document.getElementById('dailyProduction').value);
                                        const annualWorkingDays = parseInt(document.getElementById('annualWorkingDays').value);
                                        const hourlyLaborCost = parseFloat(document.getElementById('hourlyLaborCost').value);
                                        
                                        const vehicleTimeSavings = parseFloat(vehicle.timeSavings) || 0;
                                        const vehicleProductionRatio = getVehicleProductionRatio(vehicle.vehicle);
                                        const dailyVehicleProduction = dailyProduction * vehicleProductionRatio;
                                        const annualVehicleProduction = dailyVehicleProduction * annualWorkingDays;

                                        let vehicleAnnualTimeSavings = vehicleTimeSavings * annualVehicleProduction;
                                        const currentPercentage = parseInt(document.getElementById('improvementPercentage').value);
                                        if (currentPercentage > 10) {
                                            const adjustmentFactor = Math.pow(0.95, (currentPercentage - 10) / 10);
                                            vehicleAnnualTimeSavings *= adjustmentFactor;
                                        }
                                        
                                        const vehicleAnnualCostSavings = Math.round(vehicleAnnualTimeSavings * hourlyLaborCost).toLocaleString();
                                        
                                        // Maliyet tasarruf değerini araca ekleyelim ki sıralayabilelim
                                        return {...vehicle, calculatedAnnualCostSavings: vehicleAnnualCostSavings};
                                    })
                                    // Yıllık maliyet tasarrufuna göre sırala (büyükten küçüğe)
                                    .sort((a, b) => b.calculatedAnnualCostSavings - a.calculatedAnnualCostSavings)
                                    .map(vehicle => {
                                        // Sıralanmış araçlar için gösterim değerlerini hesapla
                                        const dailyProduction = parseInt(document.getElementById('dailyProduction').value);
                                        const annualWorkingDays = parseInt(document.getElementById('annualWorkingDays').value);
                                        const hourlyLaborCost = parseFloat(document.getElementById('hourlyLaborCost').value);
                                        
                                        const vehicleTimeSavings = parseFloat(vehicle.timeSavings) || 0;
                                        const vehicleProductionRatio = getVehicleProductionRatio(vehicle.vehicle);
                                        const dailyVehicleProduction = dailyProduction * vehicleProductionRatio;
                                        const annualVehicleProduction = dailyVehicleProduction * annualWorkingDays;

                                        let vehicleAnnualTimeSavings = vehicleTimeSavings * annualVehicleProduction;
                                        const currentPercentage = parseInt(document.getElementById('improvementPercentage').value);
                                        if (currentPercentage > 10) {
                                            const adjustmentFactor = Math.pow(0.95, (currentPercentage - 10) / 10);
                                            vehicleAnnualTimeSavings *= adjustmentFactor;
                                        }
                                        
                                        const vehicleAnnualCostSavings = Math.round(vehicleAnnualTimeSavings * hourlyLaborCost).toLocaleString();
                                        
                                        // Tasarruf yüzdesine göre hücre rengi belirle
                                        const savingPercent = parseFloat(vehicle.percentageSavings);
                                        let percentageClass = '';
                                        
                                        if (savingPercent >= 10) {
                                            percentageClass = 'table-success';
                                        } else if (savingPercent >= 5) {
                                            percentageClass = 'table-info';
                                        } else if (savingPercent > 0) {
                                            percentageClass = 'table-warning';
                                        } else {
                                            percentageClass = 'table-danger';
                                        }
                                        
                                        return `
                                        <tr>
                                            <td><strong>${vehicle.vehicle}</strong></td>
                                            <td class="number-value">${vehicle.beforeTotal}</td>
                                            <td class="number-value">${vehicle.afterTotal}</td>
                                            <td class="number-value">${vehicle.timeSavings}</td>
                                            <td class="${percentageClass} number-value">${vehicle.percentageSavings}%</td>
                                            <td class="number-value">${vehicleAnnualTimeSavings.toLocaleString()}</td>
                                            <td class="number-value"><span class="currency">${vehicleAnnualCostSavings} TL</span></td>
                                        </tr>`;
                                    }).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="table-secondary">
                                    <th colspan="5">TOPLAM FABRİKA ETKİSİ:</th>
                                    <th class="number-value">${parseFloat(results.financialImpact.annualTimeSavings).toFixed(1)}</th>
                                    <th class="number-value">${parseInt(results.financialImpact.annualCostSavings).toLocaleString()} TL</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Grafiği çiz
    const ctx = document.getElementById('simulationChart').getContext('2d');
    
    // Grafikte gösterilecek araçları, tasarruf miktarına göre sırala ve en çok 10 araç göster
    const sortedVehicles = [...results.vehicleResults].sort((a, b) => parseFloat(b.timeSavings) - parseFloat(a.timeSavings));
    const chartVehicles = sortedVehicles.slice(0, 10);
    
    // Grafikte gösterilen araçları da tasarruf yüzdesine göre sıralayalım
    const sortedByPercentage = [...results.vehicleResults].sort((a, b) => parseFloat(b.percentageSavings) - parseFloat(a.percentageSavings));
    const topPercentageSavings = sortedByPercentage.slice(0, 10);
    
    // Finansal parametreleri al
    const dailyProduction = parseInt(document.getElementById('dailyProduction').value);
    const annualWorkingDays = parseInt(document.getElementById('annualWorkingDays').value);
    const hourlyLaborCost = parseFloat(document.getElementById('hourlyLaborCost').value);
    
    // Yıllık tasarruf değerlerini hesapla
    const annualSavings = chartVehicles.map(v => {
        const vehicleTimeSavings = parseFloat(v.timeSavings) || 0;
        const vehicleProductionRatio = getVehicleProductionRatio(v.vehicle);
        const dailyVehicleProduction = dailyProduction * vehicleProductionRatio;
        const annualVehicleProduction = dailyVehicleProduction * annualWorkingDays;
        return (vehicleTimeSavings * annualVehicleProduction).toFixed(1);
    });
    
    // Maliyet tasarruflarını hesapla
    const costSavings = annualSavings.map(saving => Math.round(parseFloat(saving) * hourlyLaborCost).toLocaleString());
    
    // Ortalama değer hesapla
    const avgBeforeTotal = chartVehicles.reduce((sum, v) => sum + parseFloat(v.beforeTotal), 0) / chartVehicles.length;
    const avgAfterTotal = chartVehicles.reduce((sum, v) => sum + parseFloat(v.afterTotal), 0) / chartVehicles.length;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartVehicles.map(v => v.vehicle),
            datasets: [
                {
                    label: 'İyileştirme Öncesi (saat)',
                    data: chartVehicles.map(v => parseFloat(v.beforeTotal)),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderWidth: 1,
                    order: 2
                },
                {
                    label: 'İyileştirme Sonrası (saat)',
                    data: chartVehicles.map(v => parseFloat(v.afterTotal)),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderWidth: 1,
                    order: 3
                },
                {
                    label: 'Tasarruf Yüzdesi (%)',
                    data: chartVehicles.map(v => parseFloat(v.percentageSavings)),
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '${results.operation} İşlemi İyileştirme Sonuçları (En Çok Tasarruf Sağlayan Araçlar)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const datasetIndex = context.datasetIndex;
                            
                            if (datasetIndex === 0 || datasetIndex === 1) {
                                return [
                                    'Tasarruf: ' + chartVehicles[index].timeSavings + ' saat (' + chartVehicles[index].percentageSavings + '%)',
                                    'Yıllık Tasarruf: ' + annualSavings[index] + ' saat',
                                    'Yıllık Maliyet Tasarrufu: ' + costSavings[index] + ' TL'
                                ];
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Süre (saat)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Tasarruf Yüzdesi (%)'
                    },
                    min: 0,
                    max: 20,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}
