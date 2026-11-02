import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus } from 'lucide-react';
import { QuickTips } from '@/components/QuickTips';
import { estimateNutrition } from '@/lib/nutrition';
import { validateRecipe } from '@/lib/validation';
import { RecipeSubmissionValidator } from '@/components/RecipeSubmissionValidator';
import { parseIngredients } from '@/lib/parser';

export const RecipeSubmission: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('receitas de comidas');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [bulkIngredients, setBulkIngredients] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState('Fácil');
  const [errors, setErrors] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState({ cals: 0, prot: 0, fat: 0, carb: 0 });

  // Load draft
  useEffect(() => {
    const savedDraft = window.localStorage.getItem('recipe_draft');
    if (savedDraft) {
      const { title, category, ingredients, steps, difficulty } = JSON.parse(savedDraft);
      setTitle(title); setCategory(category); setIngredients(ingredients); setSteps(steps);
      if (difficulty) setDifficulty(difficulty);
    }
  }, []);

  // Save draft
  useEffect(() => {
    localStorage.setItem('recipe_draft', JSON.stringify({ title, category, ingredients, steps, difficulty }));
    setErrors(validateRecipe(title, ingredients, steps));
    setNutrition(estimateNutrition(ingredients));
  }, [title, category, ingredients, steps, difficulty]);

  const submit = async () => {
    if (errors.length > 0 || !user || !title) return;
    
    let finalNutrition = nutrition;
    try {
        const res = await fetch('/api/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: ingredients.filter(i => i.trim()) })
        });
        const data = await res.json();
        if (data && !data.error) finalNutrition = data;
    } catch (e) { console.error('API Nutrition failed, using local estimate', e); }

    await supabase.from('items').insert({ 
        title, 
        category, 
        ingredients: ingredients.filter(i => i.trim()), 
        steps: steps.filter(s => s.trim()), 
        level: difficulty,
        nutrition: finalNutrition,
        user_id: user.id 
    });
    window.alert('Receita enviada!');
    setTitle(''); setCategory('receitas de comidas'); setIngredients(['']); setSteps(['']);
    localStorage.removeItem('recipe_draft');
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold">Compartilhe sua Receita</h2>
      
      <RecipeSubmissionValidator errors={errors} />

      <div className="bg-sand p-3 rounded-lg text-sm">
        <p className="font-bold">Estimativa Nutricional:</p>
        <p>{nutrition.cals} kcal, {nutrition.prot}g prot, {nutrition.fat}g fat, {nutrition.carb}g carb</p>
      </div>

      <input className="input" placeholder="Título" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
      
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="receitas de comidas">Comidas/Outros</option>
        <option value="receitas de saude">Receitas de Saúde</option>
        <option value="receitas de produçao de produtos artesanais">Produção de Sabão Artesanal</option>
        <option value="industrial">Industrial</option>
      </select>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted uppercase">Dificuldade</label>
        <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Fácil">Fácil</option>
          <option value="Médio">Médio</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-sm">Importar lista de ingredientes (cole aqui)</label>
        <textarea className="input" value={bulkIngredients} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setBulkIngredients(e.target.value);
            setIngredients(parseIngredients(e.target.value));
        }} placeholder="1 xícara de farinha&#10;2 ovos" />
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-sm">Ingredientes</label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex gap-2">
                <input className="input" value={ing} onChange={(e) => {
                    const newIngs = [...ingredients];
                    newIngs[i] = (e.target as HTMLInputElement).value;
                    setIngredients(newIngs);
                }} />
                <button className="btn-secondary" onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>
            </div>
            <QuickTips ingredient={ing} />
          </div>
        ))}
        <button className="btn-secondary w-full" onClick={() => setIngredients([...ingredients, ''])}><Plus size={16} /> Adicionar ingrediente</button>
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-sm">Passo a passo</label>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2">
            <textarea className="input" value={step} onChange={(e) => {
                const newSteps = [...steps];
                newSteps[i] = (e.target as HTMLTextAreaElement).value;
                setSteps(newSteps);
            }} />
            <button className="btn-secondary" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>
          </div>
        ))}
        <button className="btn-secondary w-full" onClick={() => setSteps([...steps, ''])}><Plus size={16} /> Adicionar passo</button>
      </div>

      <button className="btn-primary w-full" onClick={submit}>Enviar Receita</button>
    </div>
  );
};
