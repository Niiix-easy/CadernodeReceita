import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus } from 'lucide-react';
import { QuickTips } from '@/components/QuickTips';
import { estimateNutrition } from '@/lib/nutrition';
import { validateRecipe } from '@/lib/validation';
import { RecipeSubmissionValidator } from '@/components/RecipeSubmissionValidator';
import { parseIngredients } from '@/lib/parser';
export const RecipeSubmission = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('receitas de comidas');
    const [ingredients, setIngredients] = useState(['']);
    const [bulkIngredients, setBulkIngredients] = useState('');
    const [steps, setSteps] = useState(['']);
    const [difficulty, setDifficulty] = useState('Fácil');
    const [errors, setErrors] = useState([]);
    const [nutrition, setNutrition] = useState({ cals: 0, prot: 0, fat: 0, carb: 0 });
    // Load draft
    useEffect(() => {
        const savedDraft = window.localStorage.getItem('recipe_draft');
        if (savedDraft) {
            const { title, category, ingredients, steps, difficulty } = JSON.parse(savedDraft);
            setTitle(title);
            setCategory(category);
            setIngredients(ingredients);
            setSteps(steps);
            if (difficulty)
                setDifficulty(difficulty);
        }
    }, []);
    // Save draft
    useEffect(() => {
        localStorage.setItem('recipe_draft', JSON.stringify({ title, category, ingredients, steps, difficulty }));
        setErrors(validateRecipe(title, ingredients, steps));
        setNutrition(estimateNutrition(ingredients));
    }, [title, category, ingredients, steps, difficulty]);
    const submit = async () => {
        if (errors.length > 0 || !user || !title)
            return;
        let finalNutrition = nutrition;
        try {
            const res = await fetch('/api/nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ingredients.filter(i => i.trim()) })
            });
            const data = await res.json();
            if (data && !data.error)
                finalNutrition = data;
        }
        catch (e) {
            console.error('API Nutrition failed, using local estimate', e);
        }
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
        setTitle('');
        setCategory('receitas de comidas');
        setIngredients(['']);
        setSteps(['']);
        localStorage.removeItem('recipe_draft');
    };
    return (_jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Compartilhe sua Receita" }), _jsx(RecipeSubmissionValidator, { errors: errors }), _jsxs("div", { className: "bg-sand p-3 rounded-lg text-sm", children: [_jsx("p", { className: "font-bold", children: "Estimativa Nutricional:" }), _jsxs("p", { children: [nutrition.cals, " kcal, ", nutrition.prot, "g prot, ", nutrition.fat, "g fat, ", nutrition.carb, "g carb"] })] }), _jsx("input", { className: "input", placeholder: "T\u00EDtulo", value: title, onChange: (e) => setTitle(e.target.value) }), _jsxs("select", { className: "input", value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "receitas de comidas", children: "Comidas/Outros" }), _jsx("option", { value: "receitas de saude", children: "Receitas de Sa\u00FAde" }), _jsx("option", { value: "receitas de produ\u00E7ao de produtos artesanais", children: "Produ\u00E7\u00E3o de Sab\u00E3o Artesanal" }), _jsx("option", { value: "industrial", children: "Industrial" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-semibold text-muted uppercase", children: "Dificuldade" }), _jsxs("select", { className: "input", value: difficulty, onChange: (e) => setDifficulty(e.target.value), children: [_jsx("option", { value: "F\u00E1cil", children: "F\u00E1cil" }), _jsx("option", { value: "M\u00E9dio", children: "M\u00E9dio" }), _jsx("option", { value: "Dif\u00EDcil", children: "Dif\u00EDcil" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-semibold text-sm", children: "Importar lista de ingredientes (cole aqui)" }), _jsx("textarea", { className: "input", value: bulkIngredients, onChange: (e) => {
                            setBulkIngredients(e.target.value);
                            setIngredients(parseIngredients(e.target.value));
                        }, placeholder: "1 x\u00EDcara de farinha\n2 ovos" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-semibold text-sm", children: "Ingredientes" }), ingredients.map((ing, i) => (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", value: ing, onChange: (e) => {
                                            const newIngs = [...ingredients];
                                            newIngs[i] = e.target.value;
                                            setIngredients(newIngs);
                                        } }), _jsx("button", { className: "btn-secondary", onClick: () => setIngredients(ingredients.filter((_, idx) => idx !== i)), children: _jsx(Trash2, { size: 16 }) })] }), _jsx(QuickTips, { ingredient: ing })] }, i))), _jsxs("button", { className: "btn-secondary w-full", onClick: () => setIngredients([...ingredients, '']), children: [_jsx(Plus, { size: 16 }), " Adicionar ingrediente"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-semibold text-sm", children: "Passo a passo" }), steps.map((step, i) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("textarea", { className: "input", value: step, onChange: (e) => {
                                    const newSteps = [...steps];
                                    newSteps[i] = e.target.value;
                                    setSteps(newSteps);
                                } }), _jsx("button", { className: "btn-secondary", onClick: () => setSteps(steps.filter((_, idx) => idx !== i)), children: _jsx(Trash2, { size: 16 }) })] }, i))), _jsxs("button", { className: "btn-secondary w-full", onClick: () => setSteps([...steps, '']), children: [_jsx(Plus, { size: 16 }), " Adicionar passo"] })] }), _jsx("button", { className: "btn-primary w-full", onClick: submit, children: "Enviar Receita" })] }));
};
