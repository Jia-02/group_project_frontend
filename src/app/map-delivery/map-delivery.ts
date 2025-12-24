import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BasicRes, Http } from '../@service/http';
import { finalize } from 'rxjs';

// 若沒裝 @types/google.maps 可先暫時加
declare const google: any;

@Component({
  selector: 'app-map-delivery',
  standalone: true,
  imports: [],
  templateUrl: './map-delivery.html',
  styleUrls: ['./map-delivery.scss'],
})
export class MapDelivery implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;
  @Input() address: string = '';
  @Input() orderNo: string = '';

  // =====（停用）模擬外送員移動 =====
  // @Input() simulateMovement: boolean = false;

  map: any;

  constructor(private http: Http) {}

  distance: string = '';
  duration: string = '';
  distanceKm: number = 0;

  @Output() distanceUpdated =
    new EventEmitter<{ orderNo: string; distanceKm: number; money: number }>();
  @Output() durationUpdated = new EventEmitter<number>();

  storeAddress: string = '高雄市前鎮區復興四路2號4樓之1';

  // 外送員定位
  driverLocation!: { lat: number; lng: number };
  driverMarker: any;

  Base: number = 45;
  Start_km: number = 1.5;
  Rate: number = 5;

  ngOnInit() {
    const wait = setInterval(() => {
      if ((window as any).google?.maps) {
        clearInterval(wait);
        if (this.address) {
          this.initMap(this.address);
        }
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['address'] && this.address) {
      this.initMap(this.address);
    }
  }
initMap(customerAddress: string) {
  const geocoder = new google.maps.Geocoder();

  const storeIcon = {
    url: 'https://maps.google.com/mapfiles/kml/shapes/dining.png',
    scaledSize: new google.maps.Size(20, 20),
  };

  const customerIcon = {
    url: 'https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png',
    scaledSize: new google.maps.Size(20, 20),
  };

  geocoder.geocode({ address: customerAddress }, (results: any, status: string) => {
    if (status !== 'OK') {
      console.error('Geocode failed:', status);
      return;
    }

    const customerLocation = results[0].geometry.location;

    if (!this.map) {
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        center: customerLocation,
        zoom: 15,
      });
    }

    // ===== 路線 =====
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // 關掉 A / B
    });
    directionsRenderer.setMap(this.map);

    directionsService.route(
      {
        origin: this.storeAddress,
        destination: customerAddress,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status !== 'OK') {
          console.error('Directions request failed:', status);
          return;
        }

        directionsRenderer.setDirections(result);
        this.getDriverLocation();
        const leg = result.routes[0].legs[0];

        // ===== 店家 Marker =====
        new google.maps.Marker({
          position: leg.start_location,
          map: this.map,
          title: '店家',
          icon: storeIcon,
        });

        // ===== 顧客 Marker =====
        new google.maps.Marker({
          position: leg.end_location,
          map: this.map,
          title: '顧客',
          icon: customerIcon,
        });

        // ===== 距離與時間 =====
        this.distance = leg.distance.text;
        const durationMinutes = Math.ceil(leg.duration.value / 60);
        this.duration = `${durationMinutes} 分`;
        this.durationUpdated.emit(durationMinutes);

        this.distanceKm = leg.distance.value / 1000;
        const deliveryFee = this.calculateFee(this.distanceKm);
        this.updateDeliveryFee(this.orderNo, this.distanceKm, deliveryFee);


      }
    );
  });
}


  calculateFee(distanceKm: number): number {
    if (distanceKm <= this.Start_km) return this.Base;
    const extraUnits = Math.ceil((distanceKm - this.Start_km) / 0.5);
    return this.Base + extraUnits * this.Rate;
  }

  updateDeliveryFee(orderNo: string, distanceKm: number, money: number) {
    this.http
      .updateDistanceAndMoney(orderNo, distanceKm, money)
      .pipe(finalize(() => console.log('更新外送費請求完成')))
      .subscribe({
        next: (res: BasicRes) => console.log('外送費更新成功', res),
        error: (err) => console.error('外送費更新失敗', err),
      });
  }

  // =====（停用）外送員實際定位 =====
  getDriverLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.driverLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.driverMarker = new google.maps.Marker({
          position: this.driverLocation,
          map: this.map,
          title: '外送員目前位置',
          icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        });
      },
      (error) => {
        console.error('外送員定位失敗', error);
      }
    );
  }

  // =====（停用）沿路線模擬外送員移動 =====
  // simulateDriverMovement(path: any[]) {
  //   let i = 0;
  //   if (this.driverMarker) this.driverMarker.setMap(null);
  //   this.driverMarker = new google.maps.Marker({
  //     position: path[0],
  //     map: this.map,
  //     title: '外送員位置',
  //     icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  //   });
  //   const latOffset = 0.005;
  //   const move = () => {
  //     if (i < path.length) {
  //       const pos = path[i];
  //       this.driverMarker.setPosition(pos);
  //       this.map.setCenter({ lat: pos.lat - latOffset, lng: pos.lng });
  //       i++;
  //       setTimeout(move, 500);
  //     }
  //   };
  //   move();
  // }
}
