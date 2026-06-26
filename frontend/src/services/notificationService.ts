import api from './api';

export const notificationService = {
  getByUtilisateur: (utilisateurId: number) =>
    api.get(`/Notifications/utilisateur/${utilisateurId}`),

  marquerLue: (id: number) =>
    api.put(`/Notifications/${id}/lue`),

   motDePasseOublie: (email: string) =>
    api.post('/Notifications/mot-de-passe-oublie', { email }),

  resetPassword: (utilisateurId: number, nouveauMotDePasse: string) =>
    api.put(`/Utilisateurs/${utilisateurId}/reset-password`, { nouveauMotDePasse }),
};
