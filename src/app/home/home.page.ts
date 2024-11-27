import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  posts: any[] = []; 

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firestore: AngularFirestore
  ) {}

  ionViewWillEnter() {
    this.getPost();  
  }

  async getPost() {
    let loader = await this.loadingCtrl.create({
      message: 'Espere un momento por favor ...',
    });
    await loader.present();

    try {
      
      this.firestore.collection('posts').snapshotChanges().subscribe((data: any[]) => {
        this.posts = data.map((e: any) => {
          return {
            id: e.payload.doc.id,  // Corrección del error tipográfico
            title: e.payload.doc.data()['title'],  // Asignamos el título
            details: e.payload.doc.data()['details'],  // Asignamos los detalles
          };
        });
      });
    } catch (e: any) {
      console.error('Error al obtener los datos: ', e);
      this.showToast('Error al cargar los posts');
    } finally {
      await loader.dismiss();
    }
  }

  
  async deletePost(id: string) {
    let loader = await this.loadingCtrl.create({
      message: 'Eliminando...',
    });
    await loader.present();
    try {
      
      await this.firestore.doc('posts/' + id).delete();
      this.showToast('Post eliminado con éxito');
    } catch (error) {
      this.showToast('Error al eliminar el post');
    } finally {
      await loader.dismiss();
    }
  }

  
  showToast(message: string) {
    this.toastCtrl
      .create({
        message: message,
        duration: 3000, 
      })
      .then((toastData) => toastData.present());
  }
}
