import api from './api';

export interface DemandeConge {
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
  certificatMedical?: File | null;
}

export const congeService = {
  getMesConges: (utilisateurId: number) =>
    api.get(`/Conges/utilisateur/${utilisateurId}`),

  getSoldes: (utilisateurId: number) =>
    api.get(`/Soldes/utilisateur/${utilisateurId}`),

  creerConge: (data: DemandeConge & { utilisateurId: number }) => {
    const formData = new FormData();
    formData.append('utilisateurId', String(data.utilisateurId));
    formData.append('typeConge', data.typeConge);
    formData.append('dateDebut', data.dateDebut);
    formData.append('dateFin', data.dateFin);
    formData.append('motif', data.motif || '');
    if (data.certificatMedical) {
      formData.append('certificatMedical', data.certificatMedical);
    }

    return api.post('/Conges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getTousLesConges: () =>
    api.get('/Conges'),

  updateStatut: (id: number, statut: string, commentaire?: string) =>
    api.put(`/Conges/${id}/statut`, { statut, commentaire }),

  proposerDates: (id: number, data: { dateDebutProposee: string; dateFinProposee: string; commentaire?: string }) =>
    api.put(`/Conges/${id}/proposition-dates`, data),

  repondreProposition: (id: number, accepte: boolean) =>
    api.put(`/Conges/${id}/reponse-proposition?accepte=${accepte}`),

  annulerConge: (id: number) =>
    api.put(`/Conges/${id}/statut`, { statut: 'Annulé' }),
};
