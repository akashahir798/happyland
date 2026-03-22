// =====================================================
// MENU PAGE (Food & Beverage)
// In-room dining menu with cart functionality
// =====================================================

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Clock, Flame } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCartStore } from '../store';

const demoMenuItems = [
    { id: '1', category: 'appetizers', name: 'Vegetable Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas', price: 150, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Samosa_in_the_making.jpg/400px-Samosa_in_the_making.jpg', isVegetarian: true, calories: 320, prepTime: 15 },
    { id: '2', category: 'appetizers', name: 'Paneer Tikka', description: 'Tandoor-roasted marinated cottage cheese cubes', price: 350, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Paneer_Tikka.jpg/400px-Paneer_Tikka.jpg', isVegetarian: true, calories: 450, prepTime: 20 },
    { id: '3', category: 'mains', name: 'Butter Chicken', description: 'Tandoori chicken simmered in a rich tomato butter gravy', price: 450, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Chicken_makhani.jpg/400px-Chicken_makhani.jpg', isVegetarian: false, calories: 650, prepTime: 25 },
    { id: '4', category: 'mains', name: 'Dal Makhani', description: 'Slow-cooked black lentils with butter and cream', price: 300, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dal_Makhani.jpg/400px-Dal_Makhani.jpg', isVegetarian: true, calories: 520, prepTime: 20 },
    { id: '5', category: 'mains', name: 'Paneer Butter Masala', description: 'Cottage cheese in a creamy tomato and cashew curry', price: 400, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Paneer_Masala.jpg/400px-Paneer_Masala.jpg', isVegetarian: true, calories: 580, prepTime: 20 },
    { id: '10', category: 'mains', name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with spiced chicken and herbs', price: 350, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Chicken_Biryani_in_Chennai.jpg/400px-Chicken_Biryani_in_Chennai.jpg', isVegetarian: false, calories: 700, prepTime: 30 },
    { id: '11', category: 'fast-food', name: 'Margherita Pizza', description: 'Classic wood-fired pizza with fresh mozzarella and basil', price: 400, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/400px-Eq_it-na_pizza-margherita_sep2005_sml.jpg', isVegetarian: true, calories: 800, prepTime: 20 },
    { id: '12', category: 'fast-food', name: 'Classic Cheeseburger', description: 'Juicy beef patty with melted cheese, lettuce, and tomato', price: 250, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/400px-Hamburger_%28black_bg%29.jpg', isVegetarian: false, calories: 650, prepTime: 15 },
    { id: '6', category: 'desserts', name: 'Gulab Jamun (2 pcs)', description: 'Deep-fried milk dumplings soaked in rose syrup', price: 120, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Gulab_Jaman.jpg/400px-Gulab_Jaman.jpg', isVegetarian: true, calories: 380, prepTime: 5 },
    { id: '7', category: 'desserts', name: 'Rasmalai (2 pcs)', description: 'Soft cottage cheese patties in sweetened saffron milk', price: 150, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Ras_Malai_-_Peshawar.jpg/400px-Ras_Malai_-_Peshawar.jpg', isVegetarian: true, calories: 320, prepTime: 5 },
    { id: '8', category: 'beverages', name: 'Mango Lassi', description: 'Traditional yogurt-based drink blended with sweet mangoes', price: 120, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mango_Lassi.jpg/400px-Mango_Lassi.jpg', isVegetarian: true, calories: 220, prepTime: 5 },
    { id: '9', category: 'beverages', name: 'Masala Chai', description: 'Indian spiced tea brewed with milk and aromatic spices', price: 60, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chai.jpg/400px-Chai.jpg', isVegetarian: true, calories: 120, prepTime: 10 }
];

function MenuPage() {
  const { items, addItem, updateQuantity, getSubtotal, getTax, getTotal } = useCartStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState(demoMenuItems);
  const [loading, setLoading] = useState(true);

  // Demo menu data
    const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'mains', name: 'Main Courses' },
    { id: 'fast-food', name: 'Fast Food' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' }
  ];

  

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menuData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (menuData.length > 0) {
          setMenuItems(menuData);
        } else {
          setMenuItems(demoMenuItems);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setMenuItems(demoMenuItems);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-sandy-50">
      {/* Header */}
      <div className="bg-ocean-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">In-Room Dining</h1>
          <p className="text-ocean-100">Delicious meals delivered to your room</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-ocean-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.isVegetarian && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                            Veg
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center text-xs text-gray-400 mb-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.prepTime} min
                        <span className="mx-2">•</span>
                        <Flame className="w-3 h-3 mr-1" />
                        {item.calories} cal
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-ocean-600">₹{item.price}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center px-3 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Your Order
                </h2>
                {cartItemCount > 0 && (
                  <span className="bg-ocean-100 text-ocean-700 px-2 py-0.5 rounded-full text-sm font-medium">
                    {cartItemCount} items
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add items from the menu</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-ocean-600 font-medium">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>₹{getTax().toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button className="w-full btn-primary py-3 mt-4">
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
