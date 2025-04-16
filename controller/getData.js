
const mongoose = require("mongoose");
const Brand = mongoose.model("Brand");

const getData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $match: {
          status: active,
        }
      },
      {
        $lookup: {
          from: "product",
          localField: "_id",
          foreignField: "product_sku_id",
          as: "products"
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "product_listing",
          localField: "products._id",
          foreignField: "product_sku_id",
          as: "marketplaces"
        }
      },
      {
        $project: {
          parentage: 1,
          mfn_sku: 1,
          sku_name: "$name",
          country: "$products.country",
          epic_purchase_cost: "$epic_purchase_cost",
          contracted_sell_price: "$contracted_sell_price",
          case_quantity: 1,
          upc_gtin: 1,
          retail_price: "$retail_price",
          asin: 1,
          lead_time: "$lead_time.value",
          weight: "$weight",
          dimensions: "$dimensions",
          packaging_weight: "$weight", // duplicate for packaging
          packaging_dimensions: "$dimensions", // duplicate for packaging
          marketplaces: {
            $map: {
              input: "$marketplaces",
              as: "market",
              in: {
                status: "$$market.status",
                marketplace: "$$market.marketplace"
              }
            }
          }
        }
      },
      {
        $facet: {
          sku: [
            { $skip: skip },
            { $limit: limit }
          ],
          total_record_count: [
            { $count: "count" }
          ]
        }
      },
      {
        $addFields: {
          total_record_count: {
            $ifNull: [{ $arrayElemAt: ["$total_record_count.count", 0] }, 0]
          },
          page: page,
          limit: limit,
          total_page_count: {
            $ceil: {
              $divide: [
                { $ifNull: [{ $arrayElemAt: ["$total_record_count.count", 0] }, 0] },
                limit
              ]
            }
          }
        }
      },
      {
        $project: {
          sku: 1,
          page: 1,
          limit: 1,
          total_page_count: 1,
          total_record_count: 1
        }
      }
    ];

    const result = await Brand.aggregate(aggregationPipeline);

    return res.status(200).json(result[0] || {
      sku: [],
      page,
      limit,
      total_page_count: 0,
      total_record_count: 0
    });

  } catch (err) {
    console.error("Error fetching SKU data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = getData;