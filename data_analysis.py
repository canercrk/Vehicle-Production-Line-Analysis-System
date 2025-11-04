# -*- coding: utf-8 -*-
import json
import math
import numpy as np

# Veri(Gerçek değil)
raw_data = {
    'İşlem1': [31, 22, 48, 30, 38, 42, 22, 31, 48, 46, 20, 47, 22, 34, 33, 17, 10, 40, 45, 32, 24],
    'İşlem2': [25, 24, 30, 16, 25, 25, 22, 21, 24, 26, 24, 15, 28, 29, 21, 18, 24, 23, 23, 30, 21],
    'İşlem3': [24, 26, 20, 25, 36, 26, 29, 43, 22, 22, 41, 20, 23, 31, 23, 42, 28, 34, 45, 33, 29],
    'İşlem4': [58, 57, 59, 61, 61, 62, 60, 64, 60, 55, 61, 61, 63, 60, 58, 56, 57, 59, 56, 63, 61],
    'İşlem5': [42, 45, 31, 21, 28, 32, 45, 38, 33, 52, 31, 44, 21, 24, 29, 18, 35, 17, 45, 24, 24],
    'İşlem6': [44, 26, 59, 51, 43, 43, 15, 23, 47, 14, 10, 41, 54, 21, 53, 30, 32, 44, 26, 44, 29],
    'İşlem7': [56, 39, 51, 55, 36, 42, 31, 52, 35, 33, 56, 60, 37, 43, 52, 55, 44, 31, 50, 31, 60],
    'İşlem8': [38, 22, 26, 31, 23, 23, 23, 36, 35, 23, 31, 20, 37, 24, 21, 28, 31, 35, 40, 40, 27]
}

vehicles = ['Araç1', 'Araç2', 'Araç3', 'Araç4', 'Aaraç5', 'Araç6', 'Araç7', 'Araç8', 'Araç9', 'Araç10', 'Araç11', 'Araç12', 'Araç13', 'Araç14', 'Araç15', 'Araç16', 'Araç17', 'Araç18', 'Araç19', 'Araç20', 'Araç21']

# Veri temizleme işlemiAAaraç9
def clean_data(raw_data):
    data = {}
    for operation in raw_data:
        data[operation] = [float('nan') if time == 0 else time for time in raw_data[operation]]
    return data

# İstatistiksel hesaplama fonksiyonları
def mean(arr):
    filtered = [t for t in arr if not math.isnan(t) and t > 0]
    if not filtered:
        return 0
    return sum(filtered) / len(filtered)

def variance(arr):
    avg = mean(arr)
    filtered = [t for t in arr if not math.isnan(t) and t > 0]
    if len(filtered) <= 1:
        return 0
    sum_of_squares = sum((val - avg) ** 2 for val in filtered)
    return sum_of_squares / (len(filtered) - 1)

def std_dev(arr):
    return math.sqrt(variance(arr))

def min_by(arr, fn):
    if not arr:
        return None
    return min(arr, key=fn)

def max_by(arr, fn):
    if not arr:
        return None
    return max(arr, key=fn)

# Temel istatistikleri hesaplama
def calculate_basic_stats(data):
    operations = list(data.keys())
    all_times = [t for op in operations for t in data[op] if not math.isnan(t) and t > 0]
    
    avg_time = mean(all_times)
    std_time = std_dev(all_times) 
    total_vehicles = len(vehicles)
    total_operations = len(operations)
    
    # Dinamik eşik değerleri hesaplama
    bottleneck_threshold = avg_time + std_time 
    efficient_threshold = avg_time - (0.3 * std_time) 
    
    operation_avgs = [{'name': op, 'avg': mean(data[op])} for op in operations]
    slowest_op = max_by(operation_avgs, lambda item: item['avg'])
    fastest_op = min_by(operation_avgs, lambda item: item['avg'])
    
    # Araç bazlı analiz
    vehicle_avgs = []
    for i, vehicle in enumerate(vehicles):
        vehicle_times = [opData[i] for opData in data.values() if i < len(opData) and not math.isnan(opData[i]) and opData[i] > 0]
        if vehicle_times:
            vehicle_avgs.append({'name': vehicle, 'avg': mean(vehicle_times)})
    
    problematic_vehicle = max_by(vehicle_avgs, lambda v: v['avg'])
    efficient_vehicle = min_by(vehicle_avgs, lambda v: v['avg'])
    
    return {
        'avg_time': round(avg_time, 1),
        'std_time': round(std_time, 1),
        'bottleneck_threshold': round(bottleneck_threshold, 1),
        'efficient_threshold': round(efficient_threshold, 1),
        'total_vehicles': total_vehicles,
        'total_operations': total_operations,
        'bottleneck_op': slowest_op['name'],
        'bottleneck_time': round(slowest_op['avg'], 1),
        'most_efficient_op': fastest_op['name'],
        'min_operation_time': round(fastest_op['avg'], 1),
        'problematic_vehicle': problematic_vehicle['name'] if problematic_vehicle else 'Unknown',
        'efficient_vehicle': efficient_vehicle['name'] if efficient_vehicle else 'Unknown'
    }

# Operasyon grafiği için veri hazırlama
def prepare_operation_chart_data(data, bottleneck_op):
    operations = list(data.keys())
    avg_times = [mean(data[op]) for op in operations]
    
    return {
        'labels': operations,
        'data': avg_times,
        'bottleneck_op': bottleneck_op
    }

# Araç grafiği için veri hazırlama
def prepare_vehicle_chart_data(data, vehicles):
    vehicle_avgs = []
    for i, vehicle in enumerate(vehicles):
        vehicle_times = [opData[i] for opData in data.values() if i < len(opData) and not math.isnan(opData[i]) and opData[i] > 0]
        if vehicle_times:
            vehicle_avgs.append({'name': vehicle, 'avg': mean(vehicle_times)})
    
    vehicle_avgs = [v for v in vehicle_avgs if v['avg'] > 0]
    vehicle_avgs.sort(key=lambda x: x['avg'])
    
    return {
        'labels': [v['name'] for v in vehicle_avgs],
        'data': [v['avg'] for v in vehicle_avgs]
    }

# Darboğaz grafiği için veri hazırlama
def prepare_bottleneck_chart_data(data, bottleneck_op):
    operations = list(data.keys())
    scatter_data = []
    
    for op in operations:
        times = [t for t in data[op] if not math.isnan(t) and t > 0]
        if times:
            scatter_data.append({
                'x': mean(times),
                'y': max(times),
                'label': op
            })
    
    return {
        'data': scatter_data,
        'bottleneck_op': bottleneck_op
    }

# Dağılım grafiği için veri hazırlama
def prepare_distribution_chart_data(data):
    all_times = [t for op_data in data.values() for t in op_data if not math.isnan(t) and t > 0]
    
    step = 10
    max_val = max(all_times)
    num_bins = math.ceil(max_val / step) + 1
    
    bins = []
    for i in range(num_bins):
        lower_bound = i * step
        upper_bound = (i + 1) * step
        count = len([t for t in all_times if lower_bound <= t < upper_bound])
        bins.append({'range': f"{lower_bound}-{upper_bound}", 'count': count})
    
    return {
        'labels': [b['range'] for b in bins],
        'data': [b['count'] for b in bins]
    }

# Detay tablosu için veri hazırlama
def prepare_detail_table_data(data, vehicles):
    operations = list(data.keys())
    table_data = []
    
    # Dinamik eşik değerlerini hesapla
    all_times = [t for op in operations for t in data[op] if not math.isnan(t) and t > 0]
    avg_time = mean(all_times)
    std_time = std_dev(all_times)
    
    bottleneck_threshold = avg_time + 0.3 * std_time  # Daha hassas eşik
    efficient_threshold = avg_time - (0.3 * std_time)# 0.5
    
    for operation in operations:
        times = [t for t in data[operation] if not math.isnan(t) and t > 0]
        if not times:
            continue
        
        min_time = min(times)
        max_time = max(times)
        
        # NaN değerleri dikkate almadan indeksleri bul
        valid_times = [t if not math.isnan(t) and t > 0 else None for t in data[operation]]
        min_index = valid_times.index(min_time)
        max_index = valid_times.index(max_time)
        
        avg = mean(times)
        variance_val = variance(times)
        
        is_bottleneck = avg > bottleneck_threshold
        is_efficient = avg < efficient_threshold
        
        status = '🔴 Darboğaz' if is_bottleneck else ('🟢 Verimli' if is_efficient else '🟡 Normal')
        
        table_data.append({
            'operation': operation,
            'fastest_vehicle': f"{vehicles[min_index]} ({min_time:.1f}h)",
            'slowest_vehicle': f"{vehicles[max_index]} ({max_time:.1f}h)",
            'avg': round(avg, 1),
            'variance': round(variance_val, 1),
            'status': status,
            'is_bottleneck': is_bottleneck,
            'is_efficient': is_efficient
        })
    
    return table_data

# Tahmin modeli oluşturma


# Öneriler oluşturma
def generate_recommendations(data, vehicles):
    operations = list(data.keys())
    recommendations = []
    
    # Dinamik eşik değerlerini hesapla
    all_times = [t for op in operations for t in data[op] if not math.isnan(t) and t > 0]
    avg_time = mean(all_times)
    std_time = std_dev(all_times)
    
    all_variances = [variance(data[op]) for op in operations]
    avg_variance = mean(all_variances)
    
    bottleneck_threshold = avg_time + std_time
    high_variance_threshold = 2 * avg_variance  # Ortalama varyansın 2 katı
    
    operation_avgs = [{
        'name': op,
        'avg': mean(data[op]),
        'variance': variance(data[op])
    } for op in operations]
    
    # Darboğaz analizi ve önerileri
    bottlenecks = [op for op in operation_avgs if op['avg'] > bottleneck_threshold]
    for op in bottlenecks:
        recommendations.append({
            'icon': '🔴',
            'text': f"{op['name']} işlemi darboğaz oluşturuyor ({op['avg']:.1f} saat). Bu işlem için ek kaynak tahsis edin veya otomasyonu düşünün."
        })
    
    # Varyans analizi ve önerileri
    high_variance = [op for op in operation_avgs if op['variance'] > high_variance_threshold]
    for op in high_variance:
        recommendations.append({
            'icon': '⚠️',
            'text': f"{op['name']} işleminde yüksek varyasyon ({op['variance']:.1f}) var. Bu, süreçlerdeki tutarsızlıklara işaret eder. Standart prosedürler oluşturun."
        })
    
    # Araç performans analizi ve önerileri
    vehicle_avgs = []
    for i, vehicle in enumerate(vehicles):
        vehicle_times = [opData[i] for opData in data.values() if i < len(opData) and not math.isnan(opData[i]) and opData[i] > 0]
        if vehicle_times:
            vehicle_avgs.append({'name': vehicle, 'avg': mean(vehicle_times)})
    
    vehicle_avgs = [v for v in vehicle_avgs if v['avg'] > 0]
    vehicle_avgs.sort(key=lambda x: x['avg'])
    
    if len(vehicle_avgs) >= 3:
        most_efficient = vehicle_avgs[0]
        least_efficient = vehicle_avgs[-1]
        
        recommendations.append({
            'icon': '🚀',
            'text': f"En verimli araç {most_efficient['name']} ({most_efficient['avg']:.1f} saat). Bu aracın üretim süreçlerini inceleyerek en iyi uygulamaları diğerlerine aktarın."
        })
        
        recommendations.append({
            'icon': '🐢',
            'text': f"En yavaş araç {least_efficient['name']} ({least_efficient['avg']:.1f} saat). Bu aracın üretim hattını detaylı inceleyerek yavaşlamanın temel nedenlerini belirleyin."
        })
    
    # Gelişmiş öneriler - operasyon korelasyonlarını baz alan
    correlations = analyze_correlations(data, vehicles)
    if correlations:
        strong_corr = [c for c in correlations if abs(c['correlation']) > 0.8]
        if strong_corr:
            top_corr = strong_corr[0]
            recommendations.append({
                'icon': '🔄',
                'text': f"{top_corr['operation1']} ve {top_corr['operation2']} operasyonları yüksek korelasyon ({top_corr['correlation']:.2f}) gösteriyor. Bu operasyonları birleştirmeyi veya ortak kaynak kullanmayı değerlendirin."
            })
    
    return recommendations

# ------------------------ GELİŞMİŞ ANALİZ FONKSİYONLARI ------------------------

# İşlem-Araç Matrisi oluşturma
def create_operation_vehicle_matrix(data, vehicles):
    """Her işlem-araç kombinasyonu için detaylı performans matrisi oluşturur"""
    operations = list(data.keys())
    matrix = []
    
    for i, vehicle in enumerate(vehicles):
        if i >= len(next(iter(data.values()))):
            continue  # Veri sınırlarını aşıyorsa atla
            
        row = {'vehicle': vehicle}
        
        for operation in operations:
            if i < len(data[operation]):
                value = data[operation][i]
                if not math.isnan(value) and value > 0:
                    row[operation] = round(value, 1)
                else:
                    row[operation] = None  # Eksik veri
            else:
                row[operation] = None
                
        if any(v is not None for k, v in row.items() if k != 'vehicle'):
            matrix.append(row)
            
    return matrix

# Pareto analizi - hangi işlemler toplam sürenin çoğunu oluşturuyor
def perform_pareto_analysis(data):
    """80/20 kuralına göre hangi işlemlerin toplam süreye en çok etki ettiğini belirler"""
    operations = list(data.keys())
    operation_totals = {}
    
    for operation in operations:
        valid_times = [t for t in data[operation] if not math.isnan(t) and t > 0]
        operation_totals[operation] = sum(valid_times)
    
    # Toplam süreye göre sırala
    sorted_ops = sorted(operation_totals.items(), key=lambda x: x[1], reverse=True)
    total_time = sum(operation_totals.values())
    
    # Kümülatif yüzdeleri hesapla
    cumulative = 0
    pareto_data = []
    
    for op, time in sorted_ops:
        percentage = time / total_time * 100
        cumulative += percentage
        
        pareto_data.append({
            'operation': op,
            'total_time': round(time, 1),
            'percentage': round(percentage, 1),
            'cumulative_percentage': round(cumulative, 1)
        })
    
    return pareto_data

# Aykırı değer tespiti
def detect_outliers(data, vehicles):
    """Her işlem için aykırı değerleri tespit eder (IQR yöntemiyle)"""
    operations = list(data.keys())
    outliers = []
    
    for operation in operations:
        times = [t for t in data[operation] if not math.isnan(t) and t > 0]
        if len(times) >= 5:  # En az 5 geçerli veri olsun
            q1 = np.percentile(times, 25)
            q3 = np.percentile(times, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            for i, time in enumerate(data[operation]):
                if i < len(vehicles) and not math.isnan(time) and time > 0:
                    if time < lower_bound or time > upper_bound:
                        outliers.append({
                            'operation': operation,
                            'vehicle': vehicles[i],
                            'time': round(time, 1),
                            'bound_type': 'lower' if time < lower_bound else 'upper',
                            'threshold': round(lower_bound if time < lower_bound else upper_bound, 1),
                            'severity': 'extreme' if (abs(time - mean(times)) > 3 * std_dev(times)) else 'moderate'
                        })
    
    # Anomali derecesine göre sırala
    outliers.sort(key=lambda x: 0 if x['severity'] == 'extreme' else 1)
    return outliers

# Darboğaz simülasyonu
def simulate_bottleneck_improvement(data, bottleneck_op, improvement_percentage=20):
    """Darboğaz işleminin süresini belirli bir yüzde azaltmanın etkisini simüle eder"""
    improved_data = {}
    for operation in data:
        if operation == bottleneck_op:
            improved_times = []
            for t in data[operation]:
                if not math.isnan(t) and t > 0:
                    # Belirtilen yüzde kadar azalt
                    improved_times.append(t * (1 - improvement_percentage/100))
                else:
                    improved_times.append(t)  # NaN veya 0 değerlerini koru
            improved_data[operation] = improved_times
        else:
            improved_data[operation] = data[operation].copy()
    
    # İyileştirme öncesi ve sonrası ortalama toplam süreleri hesapla
    before_times = []
    after_times = []
    vehicle_results = []
    
    for i in range(min(len(vehicles), len(next(iter(data.values()))))):
        # Orijinal toplam süre
        before_total = 0
        valid_before = True
        operation_times_before = {}
        
        for operation in data:
            if i < len(data[operation]) and not math.isnan(data[operation][i]) and data[operation][i] > 0:
                before_total += data[operation][i]
                operation_times_before[operation] = data[operation][i]
            else:
                valid_before = False  # Eksik veri varsa geçersiz
        
        # İyileştirilmiş toplam süre
        after_total = 0
        valid_after = True
        operation_times_after = {}
        
        for operation in improved_data:
            if i < len(improved_data[operation]) and not math.isnan(improved_data[operation][i]) and improved_data[operation][i] > 0:
                after_total += improved_data[operation][i]
                operation_times_after[operation] = improved_data[operation][i]
            else:
                valid_after = False
        
        # Eğer her iki durumda da geçerli veriler varsa listeye ekle
        if valid_before and valid_after:
            before_times.append(before_total)
            after_times.append(after_total)
            
            # Araç bazlı sonuçlar
            vehicle_results.append({
                'vehicle': vehicles[i],
                'before_total': round(before_total, 1),
                'after_total': round(after_total, 1),
                'time_savings': round(before_total - after_total, 1),
                'percentage_savings': round((before_total - after_total) / before_total * 100, 1) if before_total > 0 else 0,
                'operations_before': {op: round(time, 1) for op, time in operation_times_before.items()},
                'operations_after': {op: round(time, 1) for op, time in operation_times_after.items()}
            })
    
    # Ortalama süreler ve tasarruflar
    before_avg = mean(before_times) if before_times else 0
    after_avg = mean(after_times) if after_times else 0
    time_savings = before_avg - after_avg
    percentage_savings = (time_savings / before_avg * 100) if before_avg > 0 else 0
    
    # En çok fayda sağlayan araçları sırala
    vehicle_results.sort(key=lambda x: x['time_savings'], reverse=True)
    
    # Finansal etki hesapla 
    # Not: Bu değerler frontend tarafında config.js'ten dinamik olarak alınacak
    # Burada sadece varsayılan hesaplama için gerekli başlangıç değerleri belirliyoruz
    # Gerçek hesaplamalar JavaScript tarafında kullanıcı girişleriyle yapılacak
    hourly_labor_cost = 150  # TL/saat - frontend'de değiştirilebilir
    daily_production = 5  # araç/gün - frontend'de değiştirilebilir
    annual_working_days = 250  # gün/yıl - frontend'de değiştirilebilir
    
    annual_time_savings = time_savings * daily_production * annual_working_days
    annual_cost_savings = annual_time_savings * hourly_labor_cost
    
    # ROI hesaplama (varsayımsal yatırım maliyeti)
    estimated_investment = 0
    if bottleneck_op == 'TRIM ELEKTRİK':
        estimated_investment = improvement_percentage * 5000  # Daha karmaşık, daha pahalı
    elif bottleneck_op in ['ŞASE ELEKTRİK', 'KLİMA']:
        estimated_investment = improvement_percentage * 3000  # Orta karmaşklık
    else:
        estimated_investment = improvement_percentage * 2000  # Daha basit operasyonlar
    
    payback_period = estimated_investment / annual_cost_savings if annual_cost_savings > 0 else float('inf')
    five_year_roi = (annual_cost_savings * 5 - estimated_investment) / estimated_investment * 100 if estimated_investment > 0 else 0
    
    return {
        'bottleneck_operation': bottleneck_op,
        'improvement_percentage': improvement_percentage,
        'before_avg_total': round(before_avg, 1),
        'after_avg_total': round(after_avg, 1),
        'time_savings': round(time_savings, 1),
        'percentage_savings': round(percentage_savings, 1),
        'vehicle_results': vehicle_results,
        'top_benefited_vehicles': vehicle_results[:3] if len(vehicle_results) > 3 else vehicle_results,
        'financial_impact': {
            'hourly_labor_cost': hourly_labor_cost,
            'annual_time_savings': round(annual_time_savings, 1),
            'annual_cost_savings': round(annual_cost_savings),
            'estimated_investment': round(estimated_investment),
            'payback_period': round(payback_period, 1),
            'five_year_roi': round(five_year_roi, 1)
        }
    }






# Gelişmiş darboğaz iyileştirme simülasyonu
def advanced_bottleneck_simulation(data, vehicles):
    """
    Gelişmiş darboğaz simülasyonu - farklı iyileştirme senaryolarını değerlendirir
    ve optimum iyileştirme stratejisini belirler
    """
    operations = list(data.keys())
    
    # Her operasyon için ortalama süre hesapla
    op_avg_times = {}
    for operation in operations:
        valid_times = [t for t in data[operation] if not math.isnan(t) and t > 0]
        op_avg_times[operation] = mean(valid_times) if valid_times else 0
    
    # Operasyonları ortalama sürelerine göre sırala - en uzun süren en üstte
    sorted_ops = sorted(op_avg_times.items(), key=lambda x: x[1], reverse=True)
    
    # En uzun 3 operasyon için iyileştirme simülasyonları
    top_bottlenecks = sorted_ops[:3]
    simulations = []
    
    # Farklı iyileştirme yüzdeleri için simülasyon yap
    improvement_percentages = [10, 20, 30, 40]
    
    for op_name, avg_time in top_bottlenecks:
        op_simulations = []
        
        for percentage in improvement_percentages:
            # Temel simülasyon sonuçlarını al
            sim_result = simulate_bottleneck_improvement(data, op_name, percentage)
            
            # Tüm detaylı simülasyon sonuçlarını sakla
            op_simulations.append({
                'percentage': percentage,
                'time_savings': sim_result['time_savings'],
                'percentage_savings': sim_result['percentage_savings'],
                'before_avg_total': sim_result['before_avg_total'],
                'after_avg_total': sim_result['after_avg_total'],
                'vehicle_results': sim_result['vehicle_results'],
                'top_benefited_vehicles': sim_result['top_benefited_vehicles'],
                'financial_impact': sim_result['financial_impact']
            })
        
        # İyileştirme için en iyi yüzdeyi belirle (en yüksek 5 yıllık ROI'ye sahip)
        best_improvement = max(op_simulations, key=lambda x: x['financial_impact']['five_year_roi'])
        
        simulations.append({
            'operation': op_name,
            'average_time': round(avg_time, 1),
            'scenarios': op_simulations,
            'best_improvement_percentage': best_improvement['percentage'],
            'best_improvement_roi': best_improvement['financial_impact']['five_year_roi'],
            'best_improvement_payback': best_improvement['financial_impact']['payback_period'],
            'recommendation': f"{op_name} operasyonunda %{best_improvement['percentage']} iyileştirme yapılması {best_improvement['financial_impact']['payback_period']} yıl içinde yatırımın geri dönüşünü sağlar ve 5 yılda %{best_improvement['financial_impact']['five_year_roi']} ROI sunar."
        })
    
    # Simülasyon sonuçlarını optimize edecek diğer faktörler
    optimization_factors = [
        {
            'factor': 'İşçilik Verimliliği',
            'description': 'Çalışanların daha verimli çalışması için eğitim ve motivasyon programları',
            'potential_improvement': '10-15%',
            'implementation_difficulty': 'Orta',
            'estimated_cost': 'Düşük-Orta'
        },
        {
            'factor': 'Ekipman İyileştirmeleri',
            'description': 'Daha modern ve otomatik ekipmanlar kullanma',
            'potential_improvement': '20-30%',
            'implementation_difficulty': 'Yüksek',
            'estimated_cost': 'Yüksek'
        },
        {
            'factor': 'Yerleşim Optimizasyonu',
            'description': 'Üretim hattı yerleşimini optimize etme, gereksiz hareketleri azaltma',
            'potential_improvement': '5-15%',
            'implementation_difficulty': 'Orta',
            'estimated_cost': 'Orta'
        },
        {
            'factor': 'Paralel Çalışma',
            'description': 'Darboğaz operasyonlarda paralel istasyonlar kurma',
            'potential_improvement': '30-50%',
            'implementation_difficulty': 'Yüksek',
            'estimated_cost': 'Yüksek'
        }
    ]
    
    return {
        'simulations': simulations,
        'optimization_factors': optimization_factors,
        'total_operations': len(operations),
        'analysis_date': 'Ağustos 2025',
        'simulation_scenarios': len(improvement_percentages)
    }

# İşlem korelasyonları analizi
def analyze_correlations(data, vehicles):
    """İşlemler arası korelasyonları hesaplar - benzer performans gösteren işlemleri belirler"""
    operations = list(data.keys())
    correlations = []
    
    # Her işlem çifti için korelasyon hesapla
    for i in range(len(operations)):
        for j in range(i+1, len(operations)):
            op1 = operations[i]
            op2 = operations[j]
            
            # Her iki işlemde de geçerli veri olan araçları bul
            valid_indices = []
            for k in range(min(len(data[op1]), len(data[op2]))):
                if (k < len(data[op1]) and k < len(data[op2]) and 
                    not math.isnan(data[op1][k]) and not math.isnan(data[op2][k]) and
                    data[op1][k] > 0 and data[op2][k] > 0):
                    valid_indices.append(k)
            
            if len(valid_indices) >= 3:  # En az 3 ortak veri noktası olsun
                x = [data[op1][idx] for idx in valid_indices]
                y = [data[op2][idx] for idx in valid_indices]
                
                # Pearson korelasyon katsayısı
                corr = np.corrcoef(x, y)[0, 1]
                
                correlations.append({
                    'operation1': op1,
                    'operation2': op2,
                    'correlation': round(corr, 2),
                    'common_samples': len(valid_indices),
                    'correlation_strength': 'Güçlü' if abs(corr) >= 0.7 else ('Orta' if abs(corr) >= 0.3 else 'Zayıf')
                })
    
    # Korelasyon gücüne göre sırala
    correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
    return correlations

# Ana analiz fonksiyonu
def analyze_production_data():
    data = clean_data(raw_data)
    
    # Temel analizler
    basic_stats = calculate_basic_stats(data)
    operation_chart_data = prepare_operation_chart_data(data, basic_stats['bottleneck_op'])
    vehicle_chart_data = prepare_vehicle_chart_data(data, vehicles)
    bottleneck_chart_data = prepare_bottleneck_chart_data(data, basic_stats['bottleneck_op'])
    distribution_chart_data = prepare_distribution_chart_data(data)
    detail_table_data = prepare_detail_table_data(data, vehicles)
    
    # YENİ: Gelişmiş analizler (önce bunları hesapla)
    operation_vehicle_matrix = create_operation_vehicle_matrix(data, vehicles)
    pareto_analysis = perform_pareto_analysis(data)
    outliers = detect_outliers(data, vehicles)
    bottleneck_simulation = simulate_bottleneck_improvement(data, basic_stats['bottleneck_op'], 20)
    advanced_bottleneck = advanced_bottleneck_simulation(data, vehicles)  # YENİ: Gelişmiş darboğaz analizi
    operation_correlations = analyze_correlations(data, vehicles)
    
    # Öneriler oluştur
    recommendations = generate_recommendations(data, vehicles)
    
    # Tüm analiz sonuçlarını bir araya getir
    analysis_results = {
        'basic_stats': basic_stats,
        'operation_chart_data': operation_chart_data,
        'vehicle_chart_data': vehicle_chart_data,
        'bottleneck_chart_data': bottleneck_chart_data,
        'distribution_chart_data': distribution_chart_data,
        'detail_table_data': detail_table_data,
        'recommendations': recommendations,
        
        'raw_data': raw_data,
        'vehicles': vehicles,
        
        # YENİ: Gelişmiş analiz sonuçları
        'operation_vehicle_matrix': operation_vehicle_matrix,
        'pareto_analysis': pareto_analysis,
        'outliers': outliers,
        'bottleneck_simulation': bottleneck_simulation,
        'advanced_bottleneck': advanced_bottleneck,  # YENİ: Gelişmiş darboğaz simülasyonu
        'operation_correlations': operation_correlations[:5]  # En güçlü 5 korelasyonu göster
    }
    
    return analysis_results

# Analiz sonuçlarını JSON formatında dışa aktar
def export_analysis_results_json():
    results = analyze_production_data()
    return json.dumps(results, ensure_ascii=False, indent=2)

# JSON sonuçlarını kaydet ve HTML'i oluştur
def save_results_and_create_html():
    analysis_results = analyze_production_data()
    
    # Sonuçları JSON olarak kaydet
    with open('analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=4)
    
    # Sonuç istatistiklerini oluştur
    basic_stats = analysis_results['basic_stats']
    bottlenecks = analysis_results['bottleneck_chart_data']
    outliers = analysis_results['outliers']
    pareto = analysis_results['pareto_analysis']
    
    # Özet istatistikleri konsola yazdır
    print("\n===== ÜRETİM VERİ ANALİZİ SONUÇLARI =====")
    print(f"Toplam analiz edilen veri: {len(analysis_results['raw_data'])} operasyon x {len(vehicles)} araç")
    print(f"Araç tipleri: {', '.join(analysis_results['vehicles'])}")
    print(f"Darboğaz operasyon: {basic_stats['bottleneck_op']} (Ort. süre: {basic_stats['bottleneck_time']:.2f} dk)")
    print(f"En verimli operasyon: {basic_stats['most_efficient_op']} (Ort. süre: {basic_stats['min_operation_time']:.2f} dk)")
    print(f"Toplam operasyon sayısı: {len(analysis_results['operation_chart_data']['labels'])}")
    print(f"Aykırı değerler: {len(outliers)} adet tespit edildi")
    print(f"En sorunlu araç tipi: {basic_stats['problematic_vehicle']}")
    print("\nAnomali tespiti ve darboğaz simülasyonu tamamlandı.")
    print("Korelasyon analizi ve istatistiksel model oluşturuldu.")
    print("\nAnaliz tamamlandı! Sonuçlar analysis_results.json dosyasına kaydedildi.")
    print("Görselleştirmeler için tarayıcınızda index.html dosyasını açınız.")
    
    print("\nAnaliz sonuçları hazır!")
    print("Web arayüzünü görüntülemek için bir HTTP sunucusu üzerinden index.html dosyasını açınız.")

# Eğer bu dosya doğrudan çalıştırılırsa
#if __name__ == "__main__":
 #   save_results_and_create_html()
if __name__ == "__main__":
    import http.server
    import webbrowser
    import os
    import threading
    import time
    
    # 1. Analiz yap ve JSON'a kaydet
    save_results_and_create_html()
    
    # 2. Çalışma dizinini scriptin olduğu yere çevir
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # 3. Basit HTTP sunucusu başlat
    port = 8000
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    
    # Arka planda çalıştır
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    
    # 4. Kısa bekle ve tarayıcıda aç
    time.sleep(0.5)
    url = f'http://127.0.0.1:{port}/index.html'
    webbrowser.open_new_tab(url)
    
    # 5. Konsol çıktısı
    print("\n" + "="*60)
    print("✓ Analiz tamamlandı: analysis_results.json kaydedildi")
    print(f"✓ Web sunucusu başlatıldı: {url}")
    print("✓ Tarayıcınızda açıldı")
    print("="*60)
    print("\n[!] Sunucuyu KAPATIN: Ctrl+C yapın veya bu pencereyi kapatın\n")
    
    # 6. Sonsuz döngü - kullanıcı Ctrl+C yapmadıkça bekle
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n✓ Sunucu kapatıldı.\n")
        httpd.shutdown()
        httpd.server_close()