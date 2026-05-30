import math
from typing import Tuple

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth 
    using the Haversine formula. Returns distance in kilometers.
    """
    R = 6371.0 # Earth's radius in kilometers

    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * 
         math.cos(math.radians(lat2)) * 
         math.sin(d_lng / 2.0) ** 2)
         
    c = 2.0 * math.asin(math.sqrt(a))
    return R * c

def get_bounding_box(lat: float, lng: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Computes a bounding box (min_lat, max_lat, min_lng, max_lng) 
    around a central point for a given radius in kilometers.
    """
    # 1 degree of latitude is approximately 111 km
    lat_delta = radius_km / 111.0
    
    # 1 degree of longitude changes based on latitude
    lat_rad = math.radians(lat)
    cos_lat = math.cos(lat_rad)
    if cos_lat > 0.0:
        lng_delta = radius_km / (111.0 * cos_lat)
    else:
        lng_delta = 360.0 # Edge case: poles

    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    min_lng = lng - lng_delta
    max_lng = lng + lng_delta

    return min_lat, max_lat, min_lng, max_lng
