import React from "react";
import "./IngredientPage.module.css";

const IngredientPage: React.FC = () => {
  return (
    <div className="ingredient-page">
      <h1>Ingredient Management</h1>
      <p>Here you can add, edit, or remove ingredients.</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sugar</td>
            <td>kg</td>
            <td>50</td>
          </tr>
          <tr>
            <td>Salt</td>
            <td>kg</td>
            <td>30</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IngredientPage;
