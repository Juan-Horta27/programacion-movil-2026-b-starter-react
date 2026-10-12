// Ejercicio Kotlin · Parte 4 del TODO.md
//
// Alcance: solo lo visto en la semana 7 (val/var, funciones, clases, tipos que admiten null,
// `?.`, `?:`, if/when, plantillas de cadena). No exige proyecto Android.
// Cómo ejecutarlo: pegue el archivo en https://play.kotlinlang.org o compílelo con `kotlinc`.

// Mismo umbral de «pocas unidades» que usa la app (LOW_STOCK_THRESHOLD en domain/product.ts).
const val LOW_STOCK_THRESHOLD = 5

// `id` es `val` porque un producto nunca cambia de id. El resto es `var` porque el formulario
// de la app permite editarlos. `stock` es `Int?`: puede ser null cuando no se conoce el dato.
class Product(
    val id: Int,
    var name: String,
    var price: Double,
    var category: String,
    var stock: Int?
)

// Las mismas etiquetas de la app, más «Sin dato» para el caso null.
fun stockLabel(stock: Int?): String = when {
    stock == null -> "Sin dato"
    stock == 0 -> "Agotado"
    stock < LOW_STOCK_THRESHOLD -> "Pocas unidades"
    else -> "Disponible"
}

// Precio con el porcentaje de descuento aplicado: 10000.0 con 15 % → 8500.0.
fun applyDiscount(price: Double, percent: Int): Double = price - price * percent / 100

fun main() {
    val products = listOf(
        Product(1, "Agua mineral 600 ml", 1800.0, "Bebidas", 120),
        Product(5, "Galletas de avena x6", 2700.0, "Snacks", 0),
        Product(9, "Café molido 500 g", 18500.0, "Bebidas", null)
    )

    for (product in products) {
        println("${product.name} | ${stockLabel(product.stock)} | Precio con 10 %: ${applyDiscount(product.price, 10)}")
    }
}
