// config.js - Uygulama için varsayılan yapılandırma dosyası
const CONFIG = {
    // Finansal parametreler için varsayılan değerler
    financialParams: {
        hourlyLaborCost: 150,        // TL/saat
        dailyProduction: 5,          // araç/gün
        annualWorkingDays: 250,      // gün/yıl
        investmentCostMultiplier: 100 // % iyileştirme başına bin TL
    },
    
    // Simülasyon parametreleri
    simulationParams: {
        minImprovementPercentage: 5,  // Minimum iyileştirme yüzdesi
        maxImprovementPercentage: 50, // Maximum iyileştirme yüzdesi
        defaultImprovementPercentage: 20, // Varsayılan iyileştirme yüzdesi
        improvementStep: 5            // İyileştirme adımı
    },
    
    // UI ayarları
    uiSettings: {
        errorMessageTimeout: 5000     // Hata mesajlarının görüntülenme süresi (ms)
    }
};
