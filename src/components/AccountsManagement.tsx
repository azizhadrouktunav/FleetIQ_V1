import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  UserCircle,
  Filter } from
'lucide-react';
import { AddAccountModal } from './AddAccountModal';
interface Account {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  department: string;
  specialty: string;
  createdAt: string;
}
const MOCK_ACCOUNTS: Account[] = [
{
  id: '1',
  login: 'jdupont',
  firstName: 'Jean',
  lastName: 'Dupont',
  department: 'Transport',
  specialty: 'Toute la flotte',
  createdAt: '2024-01-15'
},
{
  id: '2',
  login: 'mmartin',
  firstName: 'Marie',
  lastName: 'Martin',
  department: 'Logistique',
  specialty: 'Département spécifique',
  createdAt: '2024-02-20'
},
{
  id: '3',
  login: 'pdurand',
  firstName: 'Pierre',
  lastName: 'Durand',
  department: 'Commercial',
  specialty: 'Spécialité',
  createdAt: '2024-03-10'
}];

export function AccountsManagement() {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const filteredAccounts = accounts.filter(
    (account) =>
    account.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleAddAccount = (accountData: any) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      login: accountData.login,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      department: accountData.departmentType,
      specialty: accountData.specialty || 'N/A',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAccounts([...accounts, newAccount]);
    setShowAddModal(false);
  };
  const handleDeleteAccount = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
    }
  };
  const handleChangePassword = (account: Account) => {
    // TODO: Implement password change modal
    alert(`Changer le mot de passe pour ${account.login}`);
  };
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAddModal(true);
  };
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Comptes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez les comptes utilisateurs et leurs accès
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAccount(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter un compte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Comptes
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {accounts.length}
                </p>
              </div>
              <UserCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Actifs ce mois
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {Math.floor(accounts.length * 0.8)}
                </p>
              </div>
              <UserCircle className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Nouveaux (30j)
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {Math.floor(accounts.length * 0.3)}
                </p>
              </div>
              <UserCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          {/* Table Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un compte..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm ml-3">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Départements / Spécialité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((account) =>
                <tr key={account.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-blue-600">
                        {account.login}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {account.firstName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {account.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-slate-700">
                          {account.department}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {account.specialty}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                        onClick={() => handleEditAccount(account)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleChangePassword(account)}
                        className="p-1.5 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Changer mot de passe">
                        
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                        title="Supprimer">
                        
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingAccount(null);
        }}
        onSave={handleAddAccount}
        editingAccount={editingAccount} />
      
    </div>);

}