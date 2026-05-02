const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { messages, recipes, plan, shop } = JSON.parse(event.body);
    
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are a personal low carb and keto cooking assistant for a type 2 diabetic with fatty liver on Mounjaro who is also swimming daily. 

Current cookbook has ${recipes?.length || 0} recipes.
Current recipes: ${JSON.stringify(recipes?.map(r => ({ id: r.id, name: r.name, carbs: r.carbs })))}
Current meal plan: ${JSON.stringify(plan)}

You can help by:
1. Suggesting and creating new low carb and keto recipes
2. Adding recipes to the cookbook
3. Planning meals
4. Managing shopping list
5. Giving dietary advice considering diabetes fatty liver and Mounjaro

When adding a recipe include at the end:
ACTION:{"type":"add_recipe","recipe":{"name":"...","carbs":0,"protein":0,"fat":0,"time":"...","ingredients":["..."],"steps":["..."],"tags":["..."]}}

When adding to meal plan include at the end:
ACTION:{"type":"add_to_plan","day":"Mon","meal":"D","recipeId":1}

When adding to shopping list include at the end:
ACTION:{"type":"add_to_shop","items":[{"name":"...","cat":"..."}]}

Always be warm friendly and practical. Pure Via sweeteners always in stock. User has Ninja blender and air fryer.`,
      messages: messages
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ content: response.content[0].text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
