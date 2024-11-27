import { Component, OnInit } from '@angular/core';
import { Post } from '../models/post.model';
import { ToastController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.page.html',
  styleUrls: ['./edit-page.page.scss'],
})
export class EditPagePage implements OnInit {
  post = {} as Post; 
  id: string = ''; 

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private actRoute: ActivatedRoute 
  ) {
    const routeId = this.actRoute.snapshot.paramMap.get("id");
    if (!routeId) {
      this.showToast("ID no encontrado");
      this.navCtrl.navigateRoot("home");
    } else {
      this.id = routeId; 
    }
  }

  ngOnInit() {
    this.getPostById(this.id); 
  }

  async getPostById(id: string) {
    let loader;
    try {
      loader = await this.loadingCtrl.create({
        message: "Cargando datos...",
      });
      await loader.present();

      const postRef = this.firestore.collection("posts").doc(id);
      const doc = await postRef.get().toPromise();
      if (doc?.exists) {
        this.post = doc.data() as Post; 
      } else {
        this.showToast("El post no existe");
        this.navCtrl.navigateRoot("home");
      }
    } catch (error: any) {
      console.error("Error al obtener los datos:", error);
      this.showToast("Error al cargar los datos: " + error.message);
    } finally {
      if (loader) {
        await loader.dismiss();
      }
    }
  }

  async updatePost(post: Post) {
    if (this.formValidation()) {
      let loader;
      try {
        loader = await this.loadingCtrl.create({
          message: "Actualizando post...",
        });
        await loader.present();

        await this.firestore.collection("posts").doc(this.id).update(post);

        this.showToast("Post actualizado con éxito");
        this.navCtrl.navigateRoot("home"); 
      } catch (error: any) {
        console.error("Error al actualizar el post:", error);
        this.showToast("Error al actualizar el post: " + error.message);
      } finally {
        if (loader) {
          await loader.dismiss();
        }
      }
    } else {
      console.log("Validación fallida");
    }
  }

  formValidation(): boolean {
    if (!this.post.title) {
      this.showToast("Ingrese un título");
      return false;
    }
    if (!this.post.details) {
      this.showToast("Ingrese detalles");
      return false;
    }
    return true;
  }

  showToast(message: string) {
    this.toastCtrl
      .create({
        message: message,
        duration: 4000,
      })
      .then((toastData) => toastData.present());
  }
}
