# Araç Üretim Hattı Analiz Sistemi

## 🚀 Link

[Vehicle Production Line Analysis](https://vehicle-production-line-analysis.netlify.app)
## Arka Plan ve Genel Bakış

Araç üretim operasyonları, operasyonel verimliliği olumsuz etkileyen sistematik plan-gerçekleşme sapmaları yaşamaktadır. Bu sapmalar, yüksek envanter seviyeleri, üretim hattında kuyruk birikmesi, artan operasyonel maliyetler ve sipariş teslimat gecikmeleri şeklinde kendini göstermektedir. Ek operasyonel zorluklar arasında makine arızaları, kalite tutarsızlıkları ve bunun sonucunda oluşan müşteri memnuniyetsizliği bulunmaktadır.

Bu analiz sistemi, bu belirtilerin arkasındaki kök nedenleri ve sorumlu operasyonları tespit etmek, üretim hattı performansını sistematik olarak iyileştirmek ve iyileştirme sonrası kazançları simüle etmek için geliştirilmiştir. Sistem, üretim verilerini otomatik analiz ve interaktif simülasyon yetenekleri aracılığıyla eyleme dönüştürülebilir içgörülere çevirerek veri odaklı karar almayı mümkün kılmaktadır.

Proje, endüstriyel süreç iyileştirmede yaygın olarak kullanılan temel bir Six Sigma çerçevesi olan DMAIC (Define-Measure-Analyze-Improve-Control - Tanımla-Ölç-Analiz Et-İyileştir-Kontrol Et) metodolojisini uygulamaktadır. Bu yapısal yaklaşım, her aşamanın sistematik olarak ilerlemesini, kararların somut verilere dayanmasını ve çözümlerin sürdürülebilir olmasını sağlamaktadır.

---

## Veri Yapısı

Analiz, birden fazla operasyon ve araç tipi genelinde üretim süresi verilerini kullanmaktadır. Veri seti üç temel bilgi katmanını kapsamaktadır:

### Temel Veri Bileşenleri

1. **Operasyon Süre Verileri** (`raw_data`)
   - 21 araç tipi genelinde takip edilen 8 üretim operasyonu
   - Sıralı olarak etiketlenmiş operasyonlar: İşlem1, İşlem2, İşlem3, İşlem4, İşlem5, İşlem6, İşlem7, İşlem8
   - Her operasyon-araç kombinasyonu için saat cinsinden kaydedilmiş süre ölçümleri

2. **Araç Kataloğu** (`vehicles`)
   - Analiz edilen 21 farklı araç modeli
   - Sıralı olarak etiketlenmiş araçlar: Araç1, Araç2, Araç3, ..., Araç21
   - Her araç tüm üretim operasyonlarından geçmektedir

3. **Finansal Parametreler** (`config.js`)
     Saatlik işçilik maliyeti, Günlük üretim hızı, Yıllık çalışma günü, Yatırım Maliyet Çarpnı verilerini kullanıcdan istemektedir. (Default şeklinde değerler vardır)

### Veri İlişkileri

Sistem, her hücrenin belirli bir operasyon için belirli bir araç tipinin gerektirdiği süreyi temsil ettiği bir **Operasyon-Araç Matrisi** oluşturmaktadır. Bu matris yapısı şunları mümkün kılmaktadır:
- Kesitsel analiz (operasyonları tüm araçlar genelinde karşılaştırma)
- Boylamsal analiz (araç performansını tüm operasyonlar genelinde takip etme)
- İstatistiksel eşik analizi yoluyla darboğaz tespiti
- Operasyon çiftleri arasında korelasyon tespiti

### Veri Akış Mimarisi

```
Ham Üretim Verisi (Python Betiği)
    ↓
İstatistiksel Analiz ve Temizleme
    ↓
JSON Dışa Aktarımı (analysis_results.json)
    ↓
Web Dashboard Görselleştirmesi (HTML/JS/CSS)
    ↓
İnteraktif Simülasyon Arayüzü
```

---

## Yönetici Özeti

Analiz, üretim verimliliğini ve finansal performansı doğrudan etkileyen dört kritik bulgu tespit etmiştir:

1. **Ana Darboğaz Tespit Edildi**: İşlem4, ortalama 59.6 saatlik döngü süresiyle üretim hattı kısıtı olarak çalışmaktadır—bu, sistem genelindeki 36.0 saatlik ortalamanın %65 üzerindedir. Bu tek operasyon, tüm üretim hattının maksimum çıktı kapasitesini belirlemektedir.

2. **Yüksek Süreç Değişkenliği**: İşlem6, aşırı varyans (σ² = 204.8) sergilemektedir ve bu da önemli süreç kararsızlığına işaret etmektedir. Bu tutarsızlık, standartlaştırılmamış prosedürleri, malzeme bulunabilirliği sorunlarını veya beceriye bağlı yürütmeyi düşündürmektedir.

3. **Araç Seviyesi Performans Farklılığı**: Analiz, en iyi performans gösteren araç (Araç7'de 30.9 saatlik ortalama) ile en kötü performans gösteren araç (Araç19'da 41.2 saatlik ortalama) arasında %33'lük bir verimlilik açığını ortaya koymaktadır. Bu farklılık, en iyi uygulamaların tekrarlanması için fırsatlar sunmaktadır.

4. **Pareto Yoğunlaşması**: Toplam üretim süresinin %80'i sadece 3-4 operasyonda yoğunlaşmaktadır ve bu, geniş tabanlı iyileştirme girişimlerinden ziyade odaklanmış kaynak tahsisi stratejilerini doğrulamaktadır.

---

## Derinlemesine İnceleme

### Darboğaz Analizi

Sistem, darboğazları tespit etmek için **dinamik eşik hesaplaması** kullanmaktadır:
- Eşik = Sistem Ortalaması + 1 Standart Sapma
- Bu eşiği aşan herhangi bir operasyon kısıt olarak işaretlenmektedir
- İşlem4 (59.6 saat), 49.9 saatlik eşiği önemli ölçüde aşmaktadır

Darboğazın etkisi kendi döngü süresinin ötesine uzanmaktadır. İşlem4 tam kapasitede çalıştığında, yukarı akış operasyonları işlem içi stok biriktirmekte ve aşağı akış operasyonları açlık yaşamaktadır—bunlar Goldratt'ın Kısıtlar Teorisi'nde açıklanan kısıt tabanlı üretim sistemlerinin klasik belirtileridir.

**Finansal Etki Ölçümü**:
- 150 TL/saat işçilik maliyeti ve 5 araç/gün üretim hızı varsayımı
- Yıllık bazda darboğaz gecikmeleri yaklaşık **4,425,000 TL** işçilik verimsizliği maliyetine neden olabilmektedir
- İşlem4'teki her **%10'luk iyileştirme yaklaşık 1,118,000 TL** yıllık tasarruf anlamına gelmektedir

### Pareto Analizi

80/20 kuralı doğrulaması şunları göstermektedir:
- **İlk 3 operasyon** (İşlem4, İşlem7, İşlem6) toplam üretim süresinin **%48.8'ine** katkıda bulunmaktadır
- **İlk 5 operasyon** ise toplam sürenin **%71.3'üne** katkıda bulunmakta, klasik Pareto prensibini doğrulamaktadır
- Bu yoğunlaşma, iyileştirme kaynaklarının öncelikle İşlem4 (darboğaz), ardından İşlem7 ve İşlem6'ya tahsis edilmesini gerektirmektedir
- Kalan 3 operasyon (İşlem3, İşlem8, İşlem2) toplam sürenin yalnızca %28.7'sini oluşturmakta ve sürekli izleme gerektirmektedir

### Araç Verimlilik Dağılımı

Sistem, tüm 21 aracı ortalama toplam üretim süresine göre sıralamaktadır:
- **En İyi Performans** (Araç7): Toplam 30.9 saat → kıyaslama standardı olarak hizmet etmektedir
- **En Kötü Performans** (Araç19): Toplam 41.2 saat → kök neden analizi gerektirmektedir
- **İyileştirme Fırsatı**: Araç7'nin süreç özelliklerinin tekrarlanması, sistem genelinde döngü süresini %25'e kadar azaltabilir

Panodaki renk kodlu görselleştirme, paydaşlara performans durumunu anında iletmek için yeşil-sarı-kırmızı geçişi kullanmaktadır.

### Simülasyon Modeli Doğrulaması

**İnteraktif Darboğaz Simülasyon Modülü**, kullanıcıların "ya olursa" senaryolarını test etmelerine olanak tanımaktadır:
- Hedef operasyonu seçin (varsayılan: İşlem4)
- İyileştirme yüzdesini seçin (%5-%50 aralığında %5'lik artışlarla)
- Finansal parametreleri girin (işçilik maliyeti, üretim hacmi, yatırım maliyeti)
- **Çıktı**: Zaman tasarrufu, maliyet tasarrufu, ROI hesaplaması, geri ödeme süresi

---

## Öneriler

Ortaya çıkarılan bulgulara dayanarak, aşağıdaki öneriler sunulmaktadır:

**İşlem4 darboğazını acilen giderin.** Üretim süresinin %65'ini tek başına oluşturan İşlem4, tüm hattın çıktısını sınırlamaktadır. Bu operasyona ek personel tahsis edin veya yarı-otomatik ekipman yatırımı değerlendirin. %15-20'lik bir iyileştirme, yıllık 2 - 3M TL tasarruf sağlayabilir ve 8-12 ay içinde geri ödeme yapılabilir.

**İşlem6'da standart çalışma prosedürleri oluşturun.** %40'ın üzerinde varyasyon katsayısı gösteren İşlem6, tutarsız çalışma yöntemlerine işaret etmektedir. Görsel iş talimatları hazırlayın, en iyi operatör tekniklerini belgeleyin ve tüm ekibe standart eğitim verin. Bu, üretim süre tahminlerinde güvenilirliği artıracak ve zamanında teslimatı %12 iyileştirebilecektir.

**Araç7'nin başarısını diğer araçlara taşıyın.** Sistem ortalamasından %14 daha hızlı olan Araç7'nin üretim yöntemlerini inceleyin. Zaman-hareket çalışması yaparak transferedilebilir teknikleri tespit edin ve pilot olarak 2-3 araç tipinde test edin. Tam uyarlama halinde yıllık 5-7.6M TL tasarruf potansiyeli vardır ve 2-3 ay içinde yatırım geri dönüşü sağlanabilir

**İyileştirme kaynaklarını ilk 3 operasyona odaklayın.** Toplam üretim süresinin %48.8'i yalnızca 3 operasyonda (İşlem4, İşlem7, İşlem6) yoğunlaşmaktadır. İyileştirme bütçesinin %70-80'ini bu operasyonlara tahsis edin. Diğer operasyonları rutin izleme altında tutun ancak büyük yatırım yapmayın.

**Araç19'un neden yavaş olduğunu araştırın.** En yavaş üretilen araç modeli olan Araç19'u detaylı inceleyin. Hangi operasyonlarda en çok zaman kaybedildiğini tespit edin ve model-özel zorlukları (karmaşık montaj, malzeme tedariki, kalite reddi) belirleyin. Kök neden analizi uygulayarak çözümler geliştirin.

**Sürekli iyileştirme kültürü oluşturun.** Hat operatörlerinden düzenli iyileştirme önerileri toplayın ve başarılı önerileri uygulayanları ödüllendirin. Aylık DMAIC (Tanımla-Ölç-Analiz-İyileştir-Kontrol) inceleme döngüsü başlatın. Bu, yıllık %3-5 sürekli verimlilik artışı (~1.5-2.2M TL) sağlayacaktır.


---
